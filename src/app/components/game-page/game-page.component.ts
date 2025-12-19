import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GameService} from '../../services/game.service';
import {BoardComponent} from '../board/board.component';
import {Cell} from '../../models/cell.model';
import {BoardState} from '../../models/board.model';
import {BoardService} from '../../services/board.service';
import {LEVEL_1} from '../../levels/level1';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-game-page',
  imports: [
    CommonModule,
    BoardComponent,
  ],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.scss'
})
export class GamePageComponent implements OnInit, OnDestroy {
  selectedCell: Cell | null = null;
  board: BoardState | null = null;
  score: number = -1;
  canInteract: boolean = false;

  private destroy$ = new Subject<void>();


  constructor(
    private gameService: GameService,
    private boardService: BoardService,
  ) { }

  ngOnInit() {
    this.boardService.board$
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.board = board;
      });

    this.gameService.score$
      .pipe(takeUntil(this.destroy$))
      .subscribe(score => {
        this.score = score;
      });

    this.gameService.canInteract$
      .pipe(takeUntil(this.destroy$))
      .subscribe(canInteract => {
        this.canInteract = canInteract;
      });

    this.gameService.startGame(LEVEL_1.board);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  async onCellClick(cell: Cell) {
    if (!this.canInteract) return;

    // No cell selected
    if (!this.selectedCell) {
      this.selectedCell = cell;
      return;
    }

    // If same cell clicked, deselect
    if (this.selectedCell.index === cell.index) {
      this.selectedCell = null;
      return;
    }

    // Check if the two cells are adjacent (horizontal or vertical neighbors)
    const adj = this.selectedCell.isAdjacent(cell);
    if (!this.selectedCell.isAdjacent(cell)) {
      // replace with newly selected cell
      this.selectedCell = cell;
      return;
    }

    // Attempt swap
    await this.onPlayerSwap(this.selectedCell, cell);

    // clear selection after swap attempt
    this.selectedCell = null;
  }

  async onPlayerSwap(cellA: Cell, cellB: Cell) {
    const success = await this.gameService.playerSwap(cellA, cellB);
    if (!success) {
      // optional show some message or animation for invalid swap
      // snackbar or toast?
      console.warn('Invalid swap!');
    }
  }

}
