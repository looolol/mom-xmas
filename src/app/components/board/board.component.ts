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

  trackByCell(idx: number, cell: Cell) {
    return cell.index;
  }

  testDropSymbol(col: number) {
    this.boardService.animateDrop(col, 3);
  }

  testSwap() {
    if (!this.board) return;

    const cellA = this.board.cells[0];
    const cellB = this.board.cells[1];

    this.onPlayerSwap(cellA, cellB);
  }

  async onPlayerSwap(cellA: Cell, cellB: Cell) {
    console.log('onPlayerSwap', cellA, cellB);
    const success = await this.gameService.playerSwap(cellA, cellB);
    if (!success) {
      // optionall show some message or animation for invalid swap
    }
  }


  testClearMatch() {
    if (!this.board) return;

    const matchCells = this.board.cells.slice(0, 3);
    this.boardService.animateClear(matchCells);
  }

  protected readonly TILE_SIZE_PX = TILE_SIZE_PX;
}
