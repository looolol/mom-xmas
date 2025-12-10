import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TileComponent} from '../tile/tile.component';

@Component({
  selector: 'app-game-board',
  imports: [
    CommonModule,
    TileComponent,
  ],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent implements OnInit {
  score = 0;
  quirks = ['👂', '🔥', '🤢'];
  cells: (string | null)[] = Array(36)
    .fill(null)
    .map(() => this.quirks[Math.floor(Math.random() * this.quirks.length)]);

  spawnedIndices = new Set<number>();
  selectedIndices: number[] = [];
  swappingIndices: Set<number> = new Set();
  swapDirection: { [key: number]: 'left' | 'right' | 'up' | 'down' | null } = {};
  clearedIndices = new Set<number>();
  fallDistances: Record<number, number> = {};
  maxFallDistance: number = 0;
  fallingAnimationsCount = 0;
  private fallAnimationsDoneResolve: (() => void) | null = null;
  isSettling = false;


  ngOnInit() {
    this.clearAllMatches();
  }

  async clearAllMatches() {
    let matches = this.findMatches();

    while (matches.length > 0) {
      this.score += matches.length * 10;

      matches.forEach(idx => this.clearedIndices.add(idx));
      await this.wait(300);

      // Clear matched tiles
      matches.forEach(idx => {
        this.cells[idx] = null;
        this.clearedIndices.delete(idx);
      });

      await this.animateCollapse()

      await this.wait(400);
      this.fallDistances = {};

      matches = this.findMatches();
    }
  }

  async animateCollapse() {
    const cols = 6;
    const rows = 6;
    const fallDistancesObj: Record<number, number> = {};
    const oldCells = [...this.cells];
    const newCells = Array(cols * rows).fill(null);

    for (let c = 0; c < cols; c++) {
      let writeRow = rows - 1;

      // Collect non-cleared tiles in the column
      for (let r = rows - 1; r >= 0; r--) {
        const idx = r * cols + c;
        if (oldCells[idx] !== null) {
          const newIdx = writeRow * cols + c;

          // Fall distance is how far tile moves down
          const distance = writeRow - r;
          fallDistancesObj[idx] = distance;

          newCells[newIdx] = oldCells[idx];

          writeRow--;
        }
      }

      // Fill the empty top spots with new tiles
      for (let r = writeRow; r >= 0; r--) {
        const idx = r * cols + c;
        newCells[idx] = this.quirks[Math.floor(Math.random() * this.quirks.length)];

        if (!(idx in fallDistancesObj)) {
          fallDistancesObj[idx] = 1;//-(writeRow - r);
        }

        this.spawnedIndices.add(idx);
      }
    }

    this.fallingAnimationsCount = Object.values(fallDistancesObj)
      .filter(d => d > 0).length;

    // Keep old cells during animation, set fall distances
    this.cells = oldCells;
    this.fallDistances = { ...fallDistancesObj}
    this.maxFallDistance = Math.max(...Object.values(fallDistancesObj)
      .filter(d => d > 0)
    );
    this.isSettling = true;

    console.log('fallDistances in px:', Object.fromEntries(
      Object.entries(fallDistancesObj).map(([k, v]) => [k, v * 60])
    ));


    await new Promise(requestAnimationFrame);

    await new Promise<void>(resolve => {
      if (this.fallingAnimationsCount === 0) {
        resolve();
      }
      else {
        this.fallAnimationsDoneResolve = resolve;
      }
    });

    this.fallDistances = {};
    this.maxFallDistance = 0;
    this.cells = [...newCells];
    this.spawnedIndices.clear();

    this.isSettling = false;
  }

  onTileFallAnimationDone(index: number) {
    if (this.fallDistances[index] && this.fallDistances[index] > 0) {
      this.fallingAnimationsCount--;
    }
    if (this.fallingAnimationsCount <= 0 && this.fallAnimationsDoneResolve) {
      this.fallAnimationsDoneResolve();
      this.fallAnimationsDoneResolve = null;
    }
  }

  onCellClick(index: number) {
    if (this.selectedIndices.length === 0) {
      this.selectedIndices.push(index);
    }
    else if (this.selectedIndices.length === 1) {
      const firstIndex = this.selectedIndices[0];
      // Only proceed if second tile is adjacent to first
      if (this.isAdjacent(firstIndex, index)) {
        this.selectedIndices.push(index);
        this.trySwapAndCheck();
      }
      else {
        // Replace first selected tile with new selection if not adjacent
        this.selectedIndices = [index];
      }
    }
    else {
      // Rest selection if 2 already selected (should not happen here)
      this.selectedIndices = [index];
    }
    console.log('Clicked cell:', index, 'value', this.cells[index]);
  }

  trackByIndex(i: number) {
    return i;
  }

  swapTiles(i1: number, i2: number) {
    const temp = this.cells[i1];
    this.cells[i1] = this.cells[i2];
    this.cells[i2] = temp;
  }

  async animateSwap(i1: number, i2: number) {
    const direction = this.getSwapDirection(i1, i2);
    if (!direction) return;

    this.addSwapClasses(i1, i2, direction);
    await this.wait(300);
    this.removeSwapClasses(i1, i2);

    this.swapTiles(i1, i2);
  }

  getSwapDirection(i1: number, i2: number): 'left' | 'right' | 'up' | 'down' | null {
    const cols = 6;
    const row1 = Math.floor(i1 / cols);
    const col1 = i1 % cols;
    const row2 = Math.floor(i2 / cols);
    const col2 = i2 % cols;

    if (row1 === row2) {
      if (col2 === col1 + 1) return 'right';
      if (col2 === col1 - 1) return 'left';
    }
    else if (col1 === col2) {
      if (row2 === row1 + 1) return 'down';
      if (row2 === row1 - 1) return 'up';
    }

    return null;
  }

  addSwapClasses(i1: number, i2: number, direction: 'left' | 'right' | 'up' | 'down' | null) {
    if (!direction) return;

    this.swappingIndices.add(i1);
    this.swappingIndices.add(i2);
    this.swapDirection[i1] = direction;

    const opposite: Record<'left' | 'right' | 'up' | 'down', 'right' | 'left' | 'down' | 'up'> = {
      left: 'right',
      right: 'left',
      up: 'down',
      down: 'up',
    };

    this.swapDirection[i2] = opposite[direction];
  }

  removeSwapClasses(i1: number, i2: number) {
    this.swappingIndices.delete(i1);
    this.swappingIndices.delete(i2);

    this.swapDirection[i1] = null;
    this.swapDirection[i2] = null;
  }

  wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  findMatches(): number[] {
    const matches = new Set<number>();
    const cols = 6;
    const rows = 6;

    // Horizontal matches
    for (let r = 0; r < rows; r++) {
      let count = 1;
      for (let c = 1; c < cols; c++) {
        const idx = r * cols + c;
        const prevIdx = r * cols + c - 1;
        if (this.cells[idx] === this.cells[prevIdx]) {
          count++;
        } else {
          if (count >= 3) {
            for (let k = 0; k < count; k++) {
              matches.add(r * cols + c - 1 - k);
            }
          }
          count = 1;
        }
      }
      // Check at end of row
      if (count >= 3) {
        for (let k = 0; k < count; k++) {
          matches.add(r * cols + cols - 1 - k);
        }
      }
    }

    // Vertical matches
    for (let c = 0; c < cols; c++) {
      let count = 1;
      for (let r = 1; r < rows; r++) {
        const idx = r * cols + c;
        const prevIdx = (r - 1) * cols + c;
        if (this.cells[idx] === this.cells[prevIdx]) {
          count++;
        }
        else {
          if (count >= 3) {
            for (let k = 0; k < count; k++) {
              matches.add((r - 1 - k) * cols + c);
            }
          }
          count = 1;
        }
      }
      // Check at end of column
      if (count >= 3) {
        for (let k = 0; k < count; k++) {
          matches.add((rows - 1 - k) * cols + c);
        }
      }
    }

    return Array.from(matches);
  }

  async trySwapAndCheck() {
    const [i1, i2] = this.selectedIndices;

    await this.animateSwap(i1, i2);

    const matches = this.findMatches();

    if (matches.length > 0) {
      this.selectedIndices = [];

      await this.clearAllMatches();
    }
    else {
      // No match; revert swap animation
      await this.animateSwap(i1, i2);
    }

    // Clear selection so player can pick next swap
    this.selectedIndices = [];
  }

  isAdjacent(idx1: number, idx2: number): boolean {
    const cols = 6;
    if (idx1 === idx2) return false;

    const row1 = Math.floor(idx1 / cols);
    const col1 = idx1 % cols;
    const row2 = Math.floor(idx2 / cols);
    const col2 = idx2 % cols;

    // Adjacent if rows same and cols differ by 1
    if (row1 === row2 && Math.abs(col1 - col2) === 1) return true;
    // Adjacent if cols same and rows differ by 1
    if (col1 === col2 && Math.abs(row1 - row2) === 1) return true;

    return false;
  }
}
