import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BoardConfig, Board} from '../models/board.model';
import {Cell} from '../models/cell.model';
import { AnimationService } from '../../../animations/services/animation.service';
import {
  Dir,
  getDirectionDelta,
  getDirectionDisplayOffset,
  getOppositeDirection,
  getSwapDirection
} from '../../../core/models/direction.model';
import {Position} from '../../../core/models/position.model';
import {AnimationMode, TokenAnimation} from '../../../animations/models/animation.model';
import {MATCH_CHECK_DEPTH} from '../../../core/utils/constants';
import {LEVEL_1} from '../../game/levels/level1';
import {EmojiToken, Token} from '../models/token';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private readonly _board$ = new BehaviorSubject<Board | null>(null)
  readonly board$ = this._board$.asObservable();


  constructor(private animationService: AnimationService) { }


  get board(): Board | null {
    return this._board$.getValue();
  }

  updateBoard(newBoard: Board) {
    this._board$.next(newBoard);
  }

  initBoard(config: BoardConfig) {
    const board = Board.createFromLevel(LEVEL_1);
    this.updateBoard(board);
  }

  /**
   * --- Board State Mutations ---
   */

  swapCells(board: Board, a: Cell, b: Cell): Board {
    const newCells = board.cells.map(cell => {
      if (cell.pos.equals(a.pos)) return cell.withToken(b.token);
      if (cell.pos.equals(b.pos)) return cell.withToken(a.token);
      return cell;
    });
    return new Board(board.rows, board.cols, newCells);
  }

  clearCells(board: Board, cellsToClear: Cell[]): Board {
    const clearedCells = board.cells.map(cell =>
      cellsToClear.some(c => c.pos.equals(cell.pos)) ? cell.withToken(undefined) : cell
    );
    return new Board(board.rows, board.cols, clearedCells);
  }

  rotateRow(board: Board, row: number, dir: Dir.LEFT | Dir.RIGHT): Board {
    const rowCells = board.getRow(row);
    const tokens = rowCells.map(c => c.token);

    const rotated =
        dir === Dir.LEFT
          ? [...tokens.slice(1), tokens[0]]
          : [tokens[tokens.length - 1], ...tokens.slice(0, -1)];

    const updated = rowCells.map((cell, i) =>
      cell.withToken(rotated[i])
    );

    return board.updateCells(updated);
  }

  shuffleBoard(board: Board) {
    if (!board) return board;

    const tokens = board.cells
      .filter(cell => cell.token)
      .map(cell => cell.token!);

    for (let i = tokens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
    }

    const newCells = board.cells.map(cell => {
      if (cell.token) {
        const newtoken = tokens.pop()!;
        return cell.withToken(newtoken);
      }
      return cell;
    });

    return new Board(board.rows, board.cols, newCells);
  }

  getBomb(board: Board): Cell[] {
    const centerRow = this.getRandomInt(1, board.rows - 2);
    const centerCol = this.getRandomInt(1, board.cols - 2);

    const cellsToClear = [];
    for (let r = centerRow - 1; r <= centerRow + 1; r++) {
      for (let c = centerCol - 1; c <= centerCol + 1; c++) {
        const cell = board.getCell(new Position(r, c));
        if (cell && cell.token) {
          cellsToClear.push(cell);
        }
      }
    }

    return cellsToClear;
  }

  /**
   * --- Animation Methods ---
   */

  async animateSwap(a: Cell, b: Cell): Promise<boolean> {
    if (!a.token || !b.token) return false;

    const dir = getSwapDirection(a.pos, b.pos);
    if (!dir) return false;

    const swapDir = getSwapDirection(a.pos, b.pos);
    const oppositeDir = getOppositeDirection(swapDir);
    const offset = getDirectionDisplayOffset(swapDir);
    const oppositeOffset = getDirectionDisplayOffset(oppositeDir);

    await this.animationService.play(
      [
        {
          tokenId: a.token.id,
          renderMode: AnimationMode.Move,
          params: {
            x: offset?.x ?? '0px',
            y: offset?.y ?? '0px',
          }
        },
        {
          tokenId: b.token.id,
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
    const animCells = matchCells.filter(cell => cell.token);

    if (animCells.length === 0) return;

    await this.animationService.play(
      animCells.map(cell => ({
        tokenId: cell.token!.id,
        renderMode: AnimationMode.Clearing,
      }))
    );
  }

  async animateDrop(oldBoard: Board, newBoard: Board): Promise<void> {
    const animations: TokenAnimation[] = Array.from({ length: oldBoard.cols }).flatMap((_, col) => {
      const oldCol = oldBoard.getColumn(col);
      const newCol = newBoard.getColumn(col);

      return oldCol
        .map((oldCell, row) => {
          if (!oldCell.token) return null;

          const newRow = newCol.findIndex(c => c.token?.id === oldCell.token!.id);
          if (newRow === -1) return null;

          const fallDistance = newRow - row;
          if (fallDistance <= 0) return null;

          const animation: TokenAnimation = {
            tokenId: oldCell.token.id,
            renderMode: AnimationMode.Move,
            params: {
              x: '0px',
              y: `${fallDistance}px`,
            }
          };
          return animation;
        })
        .filter((anim): anim is TokenAnimation => anim !== null);
    });

    if (animations.length === 0) return;
    await this.animationService.play(animations);
  }

  async animateCreate(newTokens: Cell[]): Promise<void> {
    const animations: TokenAnimation[] = newTokens.map(cell => ({
      tokenId: cell.token!.id,
      renderMode: AnimationMode.Creating,
      params: {}
    }));

    if (animations.length === 0) return;
    await this.animationService.play(animations);
  }

  async animateCarousel(board: Board) {
    const animations = [];

    for (let row = 0; row < board.rows; row++) {
      const dir = row % 2 === 0 ? Dir.RIGHT : Dir.LEFT;
      const cells = board.getRow(row).filter(c => c.token);

      animations.push(...cells.map(cell => ({
        tokenId: cell.token!.id,
        renderMode: AnimationMode.Move,
        params: {
          x: dir === Dir.LEFT ? '-1px' : '1px',
          y: '0px',
        }
      })));
    }

    await this.animationService.play(animations);
  }

  async animateFadeOut(board: Board) {
    const cellsWithtokens = board.cells.filter(c => c.token);

    if (cellsWithtokens.length === 0) return;

    await this.animationService.play(
      cellsWithtokens.map(cell => ({
        tokenId: cell.token!.id,
        renderMode:AnimationMode.FadeOut,
      }))
    );
  }

  async animateFadeIn(board: Board) {
    const cellsWithtokens = board.cells.filter(c => c.token);

    if (cellsWithtokens.length === 0) return;

    await this.animationService.play(
      cellsWithtokens.map(cell => ({
        tokenId: cell.token!.id,
        renderMode:AnimationMode.FadeIn,
      }))
    );
  }

  // -- OTHER METHODS ----

  private checkMatchInDirection(board: Board, cell: Cell, delta: Position, depth: number = MATCH_CHECK_DEPTH): string | null {
    if (!cell.token) return null;

    const runLength = board.getRunLength(cell.pos, delta);
    if (runLength >= depth + 1) {
      return cell.token.kind;
    }

    return null;
  }

  public detectMatches(board: Board | null = this.board): Cell[] {
    if (!board) return [];

    const horizontalMatches = this.scanMatchesInDirection(board, getDirectionDelta(Dir.RIGHT));
    const verticalMatches = this.scanMatchesInDirection(board, getDirectionDelta(Dir.DOWN));

    const allMatches = new Set<Cell>([...horizontalMatches, ...verticalMatches]);
    return Array.from(allMatches);
  }

  private scanMatchesInDirection(board: Board, delta: Position): Set<Cell> {
    if (!board || !board.cells) return new Set<Cell>();
    const matchedCells = new Set<Cell>();

    for (const cell of board.cells) {
      if (!cell.token) continue;

      const prevPos = cell.pos.add(delta.multiply(-1));
      const prevCell = board.getCell(prevPos);
      if (prevCell?.tokenVisual === cell.token.visual) continue;

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

  applyGravity(board: Board): Board {
    let newBoard = board;

    for (let col = 0; col < board.cols; col++) {
      const column = board.getColumn(col);

      const tokens = column.filter(c => c.token).map(c => c.token!);

      const missingCount = column.length - tokens.length;

      const newTokens = Array.from({ length: missingCount }, () => EmojiToken.random());

      const finalTokens = [...newTokens, ...tokens];

      const updatedCells = column.map((cell, i) => cell.withToken(finalTokens[i]));

      newBoard = newBoard.updateCells(updatedCells);
    }

    return newBoard;
  }

  detectNewTokens(oldBoard: Board, newBoard: Board): Cell[] {
    const oldtokenIds = new Set<string>();

    for (const cell of oldBoard.cells) {
      if (cell.token) oldtokenIds.add(cell.token.id);
    }

    return newBoard.cells.filter(cell => {
      return cell.token && !oldtokenIds.has(cell.token.id);
    })
  }

  private causesMatch(board: Board, cell: Cell, tokenVisual: string): boolean {
    const testCell = cell.withToken(new EmojiToken(tokenVisual));
    const testBoard = board.updateCells([testCell]);

    const matches = this.detectMatches(testBoard);
    return matches.some(matchCell => matchCell.pos.equals(cell.pos));
  }


  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
