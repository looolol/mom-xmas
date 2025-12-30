import {computed, Injectable, signal} from '@angular/core';
import {Board} from '../models/board.model';
import {Cell} from '../models/cell.model';
import {BoardChange, BoardResult} from '../models/board.result.model';
import {Position} from '../../../core/models/position.model';
import {Dir} from '../../../core/models/direction.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  readonly board = signal<Board>(new Board({rows: 0, cols: 0}, []));

  readonly matches = computed(() =>
    this.board().findMatches()
  );

  readonly isStable = computed(() =>
    this.matches().length === 0
  );

  swap(a: Cell, b: Cell): BoardChange[] {
    const result = this.board().swapCells(a, b);
    return this.applyBoardResult(result);
  }

  clearMatches(): BoardChange[] {
    const result = this.board().clearCells(this.matches());
    return this.applyBoardResult(result);
  }

  rotateRow(row: number, dir: Dir.LEFT | Dir.RIGHT): BoardChange[] {
    const result = this.board().rotateRow(row, dir);
    return this.applyBoardResult(result);
  }

  shuffleBoard(): BoardChange[] {
    const result = this.board().shuffleBoard();

    // Ignore normal diffs for animation purposes
    this.board.set(result.board);

    return [{
      type: 'shuffle',
    }];
  }

  applyGravity(): BoardChange[] {
    const result = this.board().applyGravity();
    return this.applyBoardResult(result);
  }

  private applyBoardResult(result: BoardResult): BoardChange[] {
    const oldBoard = this.board();
    const changes = this.diffBoards(oldBoard, result);
    this.board.set(result.board);
    return changes;
  }

  diffBoards(
    oldBoard: Board,
    result: BoardResult,
  ): BoardChange[] {
    const changes: BoardChange[] = [];

    const oldPositionsByToken = new Map<string, Position>();
    for (const cell of result.changes) {
      const oldCell = oldBoard.getCell(cell.pos)!;

      if (oldCell.hasToken()) {
        oldPositionsByToken.set(oldCell.token.id, oldCell.pos);
      }
    }

    for (const cell of result.changes) {
      const oldCell = oldBoard.getCell(cell.pos);
      const newCell = result.board.getCell(cell.pos);
      if (!oldCell || !newCell) continue;

      const oldToken = oldCell?.token;
      const newToken = newCell?.token;

      // assumption that oldToken and newToken are always different
      // ow why would they be up for change?
      if (!newToken && oldToken) {
        changes.push({
          type: 'cell-cleared',
          position: cell.pos,
          tokenId: oldToken.id,
        });
      }
      else if (newToken) {
        const oldPos = oldPositionsByToken.get(newToken.id);

        if (!oldPos) {
          changes.push({
            type: 'token-spawned',
            position: cell.pos,
            tokenId: newToken.id,
            kind: newToken.kind,
          });
        } else if (!newToken.equals(oldToken)) {
          if (oldPos && !oldPos.equals(newCell.pos)) {
            changes.push({
              type: 'token-moved',
              tokenId: newToken.id,
              from: oldPos,
              to: newCell.pos,
            });
          }
        }
      }
    }

    return changes;
  }
}
