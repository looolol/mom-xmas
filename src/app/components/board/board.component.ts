import {Component, OnDestroy, OnInit} from '@angular/core';
import {BoardService} from '../../services/board.service';
import {LEVEL_1} from '../../levels/level1';
import {CommonModule} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {Cell} from '../../models/cell.model';
import {TILE_SIZE_PX} from '../../utils/constants';
import {BoardState} from '../../models/board.model';
import {Subject, takeUntil} from 'rxjs';

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

  private destroy$ = new Subject<void>();
  board: BoardState | null = null;

  constructor(private boardService: BoardService) { }

  ngOnInit() {
    this.boardService.initBoard(LEVEL_1.board);
    this.boardService.board$
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => this.board = board);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get board$() {
    return this.boardService.board$;
  }

  trackByCell(idx: number, cell: Cell) {
    return cell.index;
  }

  testDropSymbol(col: number) {
    //this.boardService.animateDropSymbol(col);
  }

  testSwap() {
    if (!this.board) return;

    const cellA = this.board.cells[0];
    const cellB = this.board.cells[1];

    this.boardService.animateSwap(cellA, cellB);
  }

  testClearMatch() {
    if (!this.board) return;

    const matchCells = this.board.cells.slice(0, 3);
    this.boardService.animateClear(matchCells);
  }

  protected readonly TILE_SIZE_PX = TILE_SIZE_PX;
}
