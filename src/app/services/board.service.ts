import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BoardConfig, BoardState} from '../models/board.model';
import {Cell, CellTypeEnum} from '../models/cell.model';
import {randomSymbolExcluding} from '../utils/random-symbol';
import {getIndex} from '../utils/board.utils';
import {FALLING_FROM_OFFBOARD, MATCH_CHECK_DEPTH} from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private readonly _board$ = new BehaviorSubject<BoardState | null>(null)
  readonly board$ = this._board$.asObservable();

  private cellMap = new Map<number, Cell>();

  initBoard(config: BoardConfig) {
    const board = this.createBoard(config);
    this._board$.next(board);
  }

  reset() {
    this.cellMap.clear();
    this._board$.next(null);
  }

  private createBoard(config: BoardConfig): BoardState {
    const { rows, cols, layout } = config;
    const cells: Cell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const type = layout?.[row]?.[col] ?? CellTypeEnum.Normal;

        cells.push({
          row,
          col,
          index: getIndex(row, col, cols),
          type,
          symbol: null
        });
      }
    }

    const board: BoardState = { rows, cols, cells };

    this.cellMap.clear();
    for (const cell of cells) {
      this.cellMap.set(cell.index, cell);
    }

    this.populateInitialSymbols(board);
    return board;
  }

  private populateInitialSymbols(board: BoardState) {
    for (let col = 0; col < board.cols; col++) {
      this.fillColumn(board, col);
    }
  }

  private fillColumn(board: BoardState, col: number) {
    const column = this.getColumn(board, col);

    for (const cell of column) {
      if (cell.type !== CellTypeEnum.Normal) continue;

      const symbolKind = this.pickSymbolForCell(board, cell);

      cell.symbol = {
        id: crypto.randomUUID(),
        kind: symbolKind,
        fallingFrom: FALLING_FROM_OFFBOARD,
      }
    }
  }

  private pickSymbolForCell(board: BoardState, cell: Cell): string {
    const forbidden = new Set<string>();

    // Check left 2
    const leftMatch = this.checkMatchInDirection(board, cell, 0, -1);
    if (leftMatch) forbidden.add(leftMatch);

    // Check up
    const upMatch = this.checkMatchInDirection(board, cell, -1, 0);
    if (upMatch) forbidden.add(upMatch);

    return randomSymbolExcluding(forbidden);
  }

  private checkMatchInDirection(board: BoardState, cell: Cell, deltaRow: number, deltaCol: number, depth: number = MATCH_CHECK_DEPTH): string | null {
    if (!cell.symbol) return null;

    const baseKind = cell.symbol.kind;

    for (let step = 1; step <= depth; step++) {
      const nextCell = this.getCell(board, cell.row + step * deltaRow, cell.col + step * deltaCol);

      if (!nextCell || !nextCell.symbol || nextCell.symbol.kind !== baseKind) {
        return null;  // no match found
      }
    }

    // If we reached here, all `depth` cells in a row match the baseKind
    return baseKind;
  }


  private getCell(board: BoardState, row: number, col: number): Cell | undefined {
    if (
      row < 0 || row >= board.rows ||
      col < 0 || col >= board.cols
    ) {
      return undefined;
    }

    return this.cellMap.get(getIndex(row, col, board.cols));
  }

  private getColumn(board: BoardState, col: number): Cell[] {
    const column: Cell[] = [];

    for (let row = 0; row < board.rows; row++) {
      const cell = this.getCell(board, row, col);
      if (cell && cell.type === CellTypeEnum.Normal) {
        column.push(cell);
      }
    }

    return column;
  }

  animateSwap(a: Cell, b: Cell) { }
  animateClear(matchCells: Cell[]): void { }
}
