import {Component, OnDestroy, OnInit} from '@angular/core';
import {BoardService} from '../../services/board.service';
import {LEVEL_1} from '../../levels/level1';
import {CommonModule} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {Cell} from '../../models/cell.model';
import {TILE_SIZE_PX} from '../../utils/constants';
import {BoardState} from '../../models/board.model';
import {Subject, takeUntil} from 'rxjs';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'app-board',
  imports: [
    CommonModule,
    CellComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, OnDestroy {

  board: BoardState | null = null;
  score: number = 0;

  selectedCell: Cell | null = null;

  private destroy$ = new Subject<void>();


  constructor(
    private boardService: BoardService,
    private gameService: GameService,
  ) { }

  ngOnInit() {
    this.gameService.startGame(LEVEL_1.board);

    this.boardService.board$
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => this.board = board);

    this.gameService.score$
      .pipe(takeUntil(this.destroy$))
      .subscribe(score => this.score = score);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get board$() {
    return this.boardService.board$;
  }

  get score$() {
    return this.gameService.score$;
  }

  get phase$() {
    return this.gameService.phase$;
  }

  async onPlayerSwap(cellA: Cell, cellB: Cell) {
    console.log('onPlayerSwap', cellA, cellB);
    const success = await this.gameService.playerSwap(cellA, cellB);
    if (!success) {
      // optional show some message or animation for invalid swap
      // snackbar or toast?
      console.warn('Invalid swap!');
    }
  }

  async onCellClick(cell: Cell) {
    if (!this.board) return;

    if (!this.gameService.canInteract$) {
      console.warn('Cannot swap right now, game is busy');
      return;
    }


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
    console.log("adj", adj);
    if (!this.selectedCell.isAdjacent(cell)) {
      // replace with newly selected cell
      this.selectedCell = cell;
      return;
    }

    // Attempt swap
    console.log("swapping cells", this.selectedCell, cell);
    await this.onPlayerSwap(this.selectedCell, cell);

    // clear selection after swap attempt
    this.selectedCell = null;
  }


  trackByCell(idx: number, cell: Cell) {
    return cell.index;
  }

  isSelected(cell: Cell): boolean {
    return this.selectedCell?.index === cell.index;
  }


  protected readonly TILE_SIZE_PX = TILE_SIZE_PX;
}
