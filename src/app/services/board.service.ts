import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {allPositions, BoardConfig, BoardState, getCellType} from '../models/board.model';
import {Cell, CellType} from '../models/cell.model';
import {randomSymbolExcluding} from '../utils/random-symbol';
import {MATCH_CHECK_DEPTH} from '../utils/constants';
import {AnimationService} from './animation.service';
import {Position} from '../models/position.model';
import {
  Dir,
  getDirectionDelta,
  getDirectionDisplayOffset,
  getOppositeDirection,
  getSwapDirection
} from '../models/direction.model';
import {AnimationMode, SymbolAnimation} from '../models/animation.model';
import {createSymbol} from '../models/symbol.model';

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

  /**
   * --- Board State Mutations ---
   */

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

  rotateRow(board: BoardState, row: number, dir: Dir.LEFT | Dir.RIGHT): BoardState {
    const rowCells = board.getRow(row);
    const symbols = rowCells.map(c => c.symbol);

    const rotated =
        dir === Dir.LEFT
          ? [...symbols.slice(1), symbols[0]]
          : [symbols[symbols.length - 1], ...symbols.slice(0, -1)];

    const updated = rowCells.map((cell, i) =>
      cell.withSymbol(rotated[i])
    );

    return board.updateCells(updated);
  }

  shuffleBoard(board: BoardState) {
    if (!board) return board;

    const symbols = board.cells
      .filter(cell => cell.symbol)
      .map(cell => cell.symbol!);

    for (let i = symbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }

    const newCells = board.cells.map(cell => {
      if (cell.symbol) {
        const newSymbol = symbols.pop()!;
        return cell.withSymbol(newSymbol);
      }
      return cell;
    });

    return new BoardState(board.rows, board.cols, newCells);
  }

  /**
   * --- Animation Methods ---
   */

  async animateSwap(a: Cell, b: Cell): Promise<boolean> {
    if (!a.symbol || !b.symbol) return false;

    const dir = getSwapDirection(a.pos, b.pos);
    if (!dir) return false;

    const swapDir = getSwapDirection(a.pos, b.pos);
    const oppositeDir = getOppositeDirection(swapDir);
    const offset = getDirectionDisplayOffset(swapDir);
    const oppositeOffset = getDirectionDisplayOffset(oppositeDir);

    await this.animationService.play(
      [
        {
          symbolId: a.symbol.id,
          renderMode: AnimationMode.Move,
          params: {
            x: offset?.x ?? '0px',
            y: offset?.y ?? '0px',
          }
        },
        {
          symbolId: b.symbol.id,
          renderMode: AnimationMode.Move,
          params: {
            x: oppositeOffset?.x ?? '0px',
            y: oppositeOffset?.y ?? '0px', }
        }
      ]
    );

    return true;
  }

  async animateClear(matchCells: Cell[]): Promise<void> {
    const animCells = matchCells.filter(cell => cell.symbol);

    if (animCells.length === 0) return;

    await this.animationService.play(
      animCells.map(cell => ({
        symbolId: cell.symbol!.id,
        renderMode: AnimationMode.Clearing,
      }))
    );
  }

  async animateDrop(oldBoard: BoardState, newBoard: BoardState): Promise<void> {
    const animations: SymbolAnimation[] = Array.from({ length: oldBoard.cols }).flatMap((_, col) => {
      const oldCol = oldBoard.getColumn(col);
      const newCol = newBoard.getColumn(col);

      return oldCol
        .map((oldCell, row) => {
          if (!oldCell.symbol) return null;

          const newRow = newCol.findIndex(c => c.symbol?.id === oldCell.symbol!.id);
          if (newRow === -1) return null;

          const fallDistance = newRow - row;
          if (fallDistance <= 0) return null;

          const animation: SymbolAnimation = {
            symbolId: oldCell.symbol.id,
            renderMode: AnimationMode.Move,
            params: {
              x: '0px',
              y: `${fallDistance}px`,
            }
          };
          return animation;
        })
        .filter((anim): anim is SymbolAnimation => anim !== null);
    });

    if (animations.length === 0) return;
    await this.animationService.play(animations);
  }

  async animateCreate(newSymbols: Cell[]): Promise<void> {
    const animations: SymbolAnimation[] = newSymbols.map(cell => ({
      symbolId: cell.symbol!.id,
      renderMode: AnimationMode.Creating,
      params: {}
    }));

    if (animations.length === 0) return;
    await this.animationService.play(animations);
  }

  async animateCarousel(board: BoardState) {
    const animations = [];

    for (let row = 0; row < board.rows; row++) {
      const dir = row % 2 === 0 ? Dir.RIGHT : Dir.LEFT;
      const cells = board.getRow(row).filter(c => c.symbol);

      animations.push(...cells.map(cell => ({
        symbolId: cell.symbol!.id,
        renderMode: AnimationMode.Move,
        params: {
          x: dir === Dir.LEFT ? '-1px' : '1px',
          y: '0px',
        }
      })));
    }

    await this.animationService.play(animations);
  }

  async animateFadeOut(board: BoardState) {
    const cellsWithSymbols = board.cells.filter(c => c.symbol);

    if (cellsWithSymbols.length === 0) return;

    await this.animationService.play(
      cellsWithSymbols.map(cell => ({
        symbolId: cell.symbol!.id,
        renderMode:AnimationMode.FadeOut,
      }))
    );
  }

  async animateFadeIn(board: BoardState) {
    const cellsWithSymbols = board.cells.filter(c => c.symbol);

    if (cellsWithSymbols.length === 0) return;

    await this.animationService.play(
      cellsWithSymbols.map(cell => ({
        symbolId: cell.symbol!.id,
        renderMode:AnimationMode.FadeIn,
      }))
    );
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
      if (prevCell?.getSymbolKind() === cell.symbol.kind) continue;

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

  applyGravity(board: BoardState): BoardState {
    let newBoard = board;

    for (let col = 0; col < board.cols; col++) {
      const column = board.getColumn(col);

      const symbols = column.filter(c => c.symbol).map(c => c.symbol!);

      const missingCount = column.length - symbols.length;

      const newSymbols = Array.from({ length: missingCount }, () => createSymbol());

      const finalSymbols = [...newSymbols, ...symbols];

      const updatedCells = column.map((cell, i) => cell.withSymbol(finalSymbols[i]));

      newBoard = newBoard.updateCells(updatedCells);
    }

    return newBoard;
  }



  detectNewSymbols(oldBoard: BoardState, newBoard: BoardState): Cell[] {
    const oldSymbolIds = new Set<string>();

    for (const cell of oldBoard.cells) {
      if (cell.symbol) oldSymbolIds.add(cell.symbol.id);
    }

    return newBoard.cells.filter(cell => {
      return cell.symbol && !oldSymbolIds.has(cell.symbol.id);
    })
  }
}
