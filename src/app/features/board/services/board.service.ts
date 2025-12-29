import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BoardConfig, Board} from '../models/board.model';
import {Cell} from '../models/cell.model';
import { AnimationService } from '../../../animations/services/animation.service';
import {
  Dir,
  getDirectionDisplayOffset,
  getOppositeDirection,
  getSwapDirection
} from '../../../core/models/direction.model';
import {AnimationMode, TokenAnimation} from '../../../animations/models/animation.model';
import {LEVEL_1} from '../../game/levels/level1';

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

}
