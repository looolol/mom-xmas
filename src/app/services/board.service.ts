import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BoardConfig, BoardState} from '../models/board.model';
import {Cell, CellTypeEnum} from '../models/cell.model';
import {randomSymbolExcluding} from '../utils/random-symbol';
import {getIndex} from '../utils/board.utils';
import {FALLING_FROM_OFFBOARD, MATCH_CHECK_DEPTH} from '../utils/constants';
import {getSwapDirection, oppositeDirection} from '../models/direction.model';
import {AnimationService} from './animation.service';
import {AnimationMode} from '../models/animation.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private readonly _board$ = new BehaviorSubject<BoardState | null>(null)
  readonly board$ = this._board$.asObservable();


  constructor(private animationService: AnimationService) { }


  initBoard(config: BoardConfig) {
    const board = this.createBoard(config);
    this._board$.next(board);
  }

  private updateBoard() {
    const board = this._board$.getValue();
    if (board) {
      this._board$.next({ ...board });
    }
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
          symbol: undefined,
        });
      }
    }

    const board: BoardState = { rows, cols, cells };

    this.seedBoard(board);
    return board;
  }

  private seedBoard(board: BoardState) {
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
        animationMode: AnimationMode.None,
        fallingFrom: FALLING_FROM_OFFBOARD,
      };
    }
  }

  public async dropAndFill(): Promise<void> {
    const board = this._board$.getValue();
    if (!board) return;

    // 1. Find cells with undefined symbols (empty)
    // 2. For each column, move symbols down to fill empties (simulate gravity)
    // 3. Fill empty top cells with new random symbols (seedColumn or similar)
    // 4. Animate drops for each affected column
    // 5. Update the board observable
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

    return board.cells[getIndex(row, col, board.cols)];
  }

  public getCellPublic(row: number, col: number): Cell | undefined {
    return this.withBoard(board => this.getCell(board, row, col));
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

  private withBoard<T>(fn: (board: BoardState) => T): T | undefined {
    const board = this._board$.getValue();
    if (!board) return undefined;
    return fn(board);
  }


  // Animations

  public async animateDrop(col: number, fallingFrom: number): Promise<void> {
    await this.withBoard(async (board) => {
      // Find first cell in the column that has a symbol;
      const cell = board.cells.find(c => c.col === col && c.symbol);
      if (!cell || !cell.symbol || !this.animationService.canAnimate(cell.symbol)) return;

      await this.animationService.startAnimationAsync({
        symbol: cell.symbol,
        mode: AnimationMode.Falling,
        params: { fallingFrom },
        onDone: () => {
          this.updateBoard();
        }
      });

      this.updateBoard();
    });
  }


  public async animateSwap(a: Cell, b: Cell): Promise<void> {
    await this.withBoard(async (board) => {
      if (!a.symbol || !b.symbol || !this.animationService.canAnimate(a.symbol, b.symbol)) return;

      const dir = getSwapDirection(a, b);
      if (!dir) {
        console.warn('Cells are not adjacent, cannot swap.');
        return;
      }

      await this.animationService.runPairedAnimation(
        a.symbol,
        b.symbol,
        {symbol: a.symbol, mode: AnimationMode.Swapping, params: {swapDirection: dir}},
        {symbol: b.symbol, mode: AnimationMode.Swapping, params: {swapDirection: oppositeDirection(dir)}}
      );

      this.swap(a, b);
      this.updateBoard();
    });
  }

  private swap(a: Cell, b: Cell) {
    const temp = a.symbol;
    a.symbol = b.symbol;
    b.symbol = temp;
  }


  public async animateClear(matchCells: Cell[]): Promise<void> {
    await this.withBoard(async (board) => {

      // Filter out cells without symbols or already animating
      const cellsToClear = matchCells.filter(cell => cell.symbol && this.animationService.canAnimate(cell.symbol));

      console.log("Clearing animations...");
      // Start clearing animations
      await Promise.all(cellsToClear.map(cell =>
        this.animationService.startAnimationAsync({
          symbol: cell.symbol!,
          mode: AnimationMode.Clearing,
        })
      ));

      console.log("Clearing symbols...");

      // After animations finish, clear symbols
      for (const cell of cellsToClear) {
        cell.symbol = undefined;
      }

      console.log("Done!");

      this.updateBoard();

      // TODO: trigger falling animation for symbols above, refill board, etc
    });
  }

}
