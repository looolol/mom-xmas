import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {allPositions, BoardConfig, BoardState, getCellType} from '../models/board.model';
import {Cell, CellType} from '../models/cell.model';
import {randomSymbolExcluding} from '../utils/random-symbol';
import {MATCH_CHECK_DEPTH} from '../utils/constants';
import {AnimationService} from './animation.service';
import {AnimationMode} from '../models/animation.model';
import {Position} from '../models/position.model';
import {createSymbol} from '../models/symbol.model';
import {Dir, getDirectionDelta, getOppositeDirection, getSwapDirection} from '../models/direction.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private readonly _board$ = new BehaviorSubject<BoardState | null>(null)
  readonly board$ = this._board$.asObservable();


  constructor(private animationService: AnimationService) { }


  get board(): BoardState | null {
    return this._board$.getValue();
  }

  updateBoard(newBoard: BoardState) {
    this._board$.next(newBoard);
  }

  initBoard(config: BoardConfig) {
    const board = this.createNewBoard(config);
    this.updateBoard(this.seedBoard(board));
  }


  private createNewBoard({rows, cols, layout}: BoardConfig): BoardState {
    const cells: Cell[] = [];

    for (let pos of allPositions(rows, cols)) {
      cells.push(new Cell(
        pos,
        pos.row * cols + pos.col,
        getCellType(pos.row, pos.col, layout),
      ));
    }

    return new BoardState(rows, cols, cells);
  }

  private seedBoard(board: BoardState) {
    let newBoard = board;
    for (let col = 0; col < board.cols; col++) {
      newBoard = this.fillColumn(newBoard, col);
    }
    return newBoard;
  }

  private fillColumn(board: BoardState, col: number): BoardState {
    const newCells = board.cells.map(cell => {
      if (cell.pos.col !== col || cell.type !== CellType.Normal) return cell;

      const symbolKind = this.pickSymbolForCell(board, cell);
      return cell.withSymbol(createSymbol(symbolKind));
    });
    return new BoardState(board.rows, board.cols, newCells);
  }

  swapCells(board: BoardState, a: Cell, b: Cell): BoardState {
    const newCells = board.cells.map(cell => {
      if (cell.pos.equals(a.pos)) return cell.withSymbol(b.symbol);
      if (cell.pos.equals(b.pos)) return cell.withSymbol(a.symbol);
      return cell;
    });
    return new BoardState(board.rows, board.cols, newCells);
  }

  clearCells(board: BoardState, cellsToClear: Cell[]): BoardState {
    const clearedCells = board.cells.map(cell =>
      cellsToClear.some(c => c.pos.equals(cell.pos)) ? cell.withSymbol(undefined) : cell
    );
    return new BoardState(board.rows, board.cols, clearedCells);
  }

  dropAndFillColumns(board: BoardState): BoardState {
    let newBoard = board;

    for (let col = 0; col < board.cols; col++) {
      const column = board.getColumn(col);

      const symbols = column.map(c => c.symbol).filter(Boolean);
      const missing = column.length - symbols.length;

      const newSymbols = Array.from({length: missing}, () => createSymbol());
      const finalSymbols = [...newSymbols, ...symbols];

      const updatedCells = column.map((cell, i) =>
        cell.withSymbol(finalSymbols[i] ?? undefined)
      );

      const newCells = newBoard.cells.map(cell => {
        const updatedCell = updatedCells.find(c => c.pos.equals(cell.pos));
        return updatedCell ?? cell;
      });

      newBoard = new BoardState(newBoard.rows, newBoard.cols, newCells);
    }

    return newBoard;
  }


  // --- ANIMATION METHODS ---

  async animateSwap(a: Cell, b: Cell): Promise<void> {
    if (!a.symbol || !b.symbol || !this.animationService.canAnimate(a.symbol, b.symbol)) {
      console.log('Cannot animate swap', a.symbol, b.symbol, this.animationService.isAnimating?.valueOf());
      return;
    }

    const dir = getSwapDirection(a.pos, b.pos);
    if (!dir) return;

    console.log(`Starting swap animation from ${a.pos} <-> ${b.pos}`);
    await this.animationService.runPairedAnimation(
      a.symbol,
      b.symbol,
      { symbol: a.symbol, mode: AnimationMode.Swapping, params: { swapDirection: dir } },
      { symbol: b.symbol, mode: AnimationMode.Swapping, params: { swapDirection: getOppositeDirection(dir) } }
    );
    console.log(`Finished swap animation from ${a.pos} <-> ${b.pos}`);

    this.updateBoard(this.swapCells(this.board!, a, b));
  }

  async animateClear(matchCells: Cell[]): Promise<void> {
    const cellsToClear = matchCells.filter(
      cell => cell.symbol && this.animationService.canAnimate(cell.symbol)
    );

    if (cellsToClear.length === 0) return;

    await Promise.all(
      cellsToClear.map(cell =>
        this.animationService.startAnimationAsync({
          symbol: cell.symbol!,
          mode: AnimationMode.Clearing,
        })
      )
    );

    console.log('Clearing animation done for all matched cells, waiting 100ms before clearing symbols...');
    await new Promise(resolve => setTimeout(resolve, 100));

    this.updateBoard(this.clearCells(this.board!, cellsToClear));
  }

  async animateDrop(col: number, fallingFrom: number): Promise<void> {
    const board = this.board;
    if (!board) return;

    const cell = board.cells.find(c => c.pos.col === col && c.symbol);
    if (!cell || !cell.symbol || !this.animationService.canAnimate(cell.symbol)) return;

    await this.animationService.startAnimationAsync({
      symbol: cell.symbol,
      mode: AnimationMode.Falling,
      params: {fallingFrom},
    });
  }

  // -- OTHER METHODS ----
  private pickSymbolForCell(board: BoardState, cell: Cell): string {
    const forbidden = new Set<string>();

    // Check left 2
    const leftMatch = this.checkMatchInDirection(board, cell, getDirectionDelta(Dir.LEFT));
    if (leftMatch) forbidden.add(leftMatch);

    // Check up
    const upMatch = this.checkMatchInDirection(board, cell, getDirectionDelta(Dir.UP));
    if (upMatch) forbidden.add(upMatch);

    return randomSymbolExcluding(forbidden);
  }

  private checkMatchInDirection(board: BoardState, cell: Cell, delta: Position, depth: number = MATCH_CHECK_DEPTH): string | null {
    if (!cell.symbol) return null;

    const runLength = board.getRunLength(cell.pos, delta);
    if (runLength >= depth + 1) {
      return cell.symbol.kind;
    }

    return null;
  }

  public detectMatches(board: BoardState | null = this.board): Cell[] {
    if (!board) return [];

    const horizontalMatches = this.scanMatchesInDirection(board, getDirectionDelta(Dir.RIGHT));
    const verticalMatches = this.scanMatchesInDirection(board, getDirectionDelta(Dir.DOWN));

    const allMatches = new Set<Cell>([...horizontalMatches, ...verticalMatches]);
    return Array.from(allMatches);
  }

  private scanMatchesInDirection(board: BoardState, delta: Position): Set<Cell> {
    if (!board || !board.cells) return new Set<Cell>();
    const matchedCells = new Set<Cell>();

    for (const cell of board.cells) {
      if (!cell.symbol) continue;

      const prevPos = cell.pos.add(delta.multiply(-1));
      const prevCell = board.getCell(prevPos);
      if (prevCell?.getSymbolKind() === cell.symbol.getKind()) continue;

      const runLength = board.getRunLength(cell.pos, delta);

      if (runLength >= 3) {
        for (let i = 0; i < runLength; i++) {
          const matchPos = cell.pos.add(delta.multiply(i));
          const matchCell = board.getCell(matchPos);
          if (matchCell) matchedCells.add(matchCell);
        }
      }
    }

    return matchedCells;
  }


}
