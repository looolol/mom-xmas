import { TestBed } from '@angular/core/testing';

import { BoardService } from './board.service';
import { Board } from '../models/board.model';
import {LEVEL_1} from '../../game/levels/level1';
import {Position} from '../../../core/models/position.model';
import { EmojiToken } from '../models/token';
import {Dir} from '../../../core/models/direction.model';

describe('BoardService', () => {
  let service: BoardService;
  let board: Board;


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardService);

    board = Board.createFromLevel(LEVEL_1);
    service['_board'].set(board);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should swap two cells and return correct BoardChanges', () => {
    const cellA = board.getCell(new Position(0, 0))!;
    const cellB = board.getCell(new Position(0, 1))!;

    const changes = service.swap(cellA, cellB);

    expect(changes).toBeDefined();
    expect(changes.length).toBe(2);

    expect(changes.some(change =>
      change.type === 'token-moved' &&
      change.tokenId === cellA.token?.id &&
      change.from.equals(cellA.pos) &&
      change.to.equals(cellB.pos)
    )).toBeTrue();

    expect(changes.some(change =>
      change.type === 'token-moved' &&
      change.tokenId === cellB.token?.id &&
      change.from.equals(cellB.pos) &&
      change.to.equals(cellA.pos)
    )).toBeTrue();

    // confirm board state updated correctly
    const newBoard = service['board']();
    expect(newBoard.getCell(new Position(0, 0))!.token?.id).toBe(cellB.token?.id);
    expect(newBoard.getCell(new Position(0, 1))!.token?.id).toBe(cellA.token?.id);
  });

  it('should clear matches', () => {
    const oldBoard = board;

    // force a match in top row
    const matchEmoji = oldBoard.getCell(new Position(0, 0))!.token!.visual;
    const matchCells = [
      oldBoard.getCell(new Position(0, 1))!.withToken(new EmojiToken(matchEmoji)),
      oldBoard.getCell(new Position(0, 2))!.withToken(new EmojiToken(matchEmoji)),
    ];
    const boardWithMatch = oldBoard.updateCells(matchCells).board;
    service['_board'].set(boardWithMatch);

    const matches = service.matches();
    expect(matches.length).toBeGreaterThan(0);

    const matchedTokenIds = matches.map(c => c.token!.id);

    // now clear them
    const changes = service.clearMatches();

    const clearChanges = changes.filter(c => c.type === 'cell-cleared');
    expect(clearChanges.length).toBe(matches.length);

    for (const change of clearChanges) {
      expect(matchedTokenIds).toContain(change.tokenId);
    }

    // verify board state
    const newBoard = service['board']();
    for (const cell of matches) {{
      expect(newBoard.getCell(cell.pos)!.token).toBeUndefined();
    }}
  });

  it('should rotate a row left and return token-moved changes', () => {
    const row = 0;

    const beforeBoard = service['board']();
    const beforeRowCells = beforeBoard.getRow(row);

    const beforePositions = beforeRowCells.map(c => c.pos);
    const beforeTokenIds = beforeRowCells.map(c => c.token?.id);

    const changes = service.rotateRow(row, Dir.LEFT);
    expect(changes.every(c => c.type === 'token-moved')).toBeTrue();

    const afterBoard = service['board']();
    const afterRowCells = afterBoard.getRow(row);

    const afterPositions = afterRowCells.map(c => c.pos);
    const afterTokenIds = afterRowCells.map(c => c.token?.id);

    // The last token after rotation should be the first before rotation (rotated left)
    expect(afterTokenIds[afterTokenIds.length - 1]).toBe(beforeTokenIds[0]);

    // The rest shifted left by one
    for (let i = 0; i < beforeTokenIds.length - 1; i++) {
      expect(afterTokenIds[i]).toBe(beforeTokenIds[i + 1]);
    }

    // Check the changes themselves reflect these moves=
    for (const change of changes) {
      expect(change.type).toBe('token-moved');

      if (change.type === 'token-moved') {
        const oldIndex = beforeTokenIds.indexOf(change.tokenId);
        expect(oldIndex).toBeGreaterThanOrEqual(0);

        const expectedOldPos = beforePositions[oldIndex];
        const expectedNewIndex = (oldIndex === 0) ? beforeTokenIds.length - 1 : oldIndex - 1;
        const expectedNewPos = afterPositions[expectedNewIndex];

        if (change.type === 'token-moved') {
          expect(change.from.equals(expectedOldPos)).toBeTrue();
          expect(change.to.equals(expectedNewPos)).toBeTrue();
        }
      }
    }
  });

  it('should rotate a row right and return token-moved changes', () => {
    const row = 0;

    const beforeBoard = service['board']();
    const beforeRowCells = beforeBoard.getRow(row);

    const beforePositions = beforeRowCells.map(c => c.pos);
    const beforeTokenIds = beforeRowCells.map(c => c.token?.id);

    const changes = service.rotateRow(row, Dir.RIGHT);
    expect(changes.every(c => c.type === 'token-moved')).toBeTrue();

    const afterBoard = service['board']();
    const afterRowCells = afterBoard.getRow(row);

    const afterPositions = afterRowCells.map(c => c.pos);
    const afterTokenIds = afterRowCells.map(c => c.token?.id);

    // The last token after rotation should be the first before rotation (rotated right)
    expect(afterTokenIds[0]).toBe(beforeTokenIds[beforeTokenIds.length - 1]);

    // The rest shifted left by one
    for (let i = 1; i < beforeTokenIds.length; i++) {
      expect(afterTokenIds[i]).toBe(beforeTokenIds[i - 1]);
    }

    // Check the changes themselves reflect these moves=
    for (const change of changes) {
      expect(change.type).toBe('token-moved');

      if (change.type === 'token-moved') {
        const oldIndex = beforeTokenIds.indexOf(change.tokenId);
        expect(oldIndex).toBeGreaterThanOrEqual(0);

        const expectedOldPos = beforePositions[oldIndex];
        const expectedNewIndex = (oldIndex === beforeTokenIds.length - 1) ? 0 : oldIndex + 1;
        const expectedNewPos = afterPositions[expectedNewIndex];

        if (change.type === 'token-moved') {
          expect(change.from.equals(expectedOldPos)).toBeTrue();
          expect(change.to.equals(expectedNewPos)).toBeTrue();
        }
      }
    }
  });

  it('should shuffle the board and emit a shuffle BoardChange', () => {
    const beforeBoard = service['board']();
    const beforeTokenIds = beforeBoard.cells.map(c => c.token?.id);

    const changes = service.shuffleBoard();

    expect(changes.length).toBe(1);
    expect(changes[0].type).toBe('shuffle');

    const afterBoard = service['board']();
    expect(afterBoard).not.toBe(beforeBoard);

    const afterTokenIds = afterBoard.cells.map(c => c.token?.id);
    expect(afterTokenIds).not.toEqual(beforeTokenIds);
  });

  it('should apply gravity correctly and return token-moved changes', () => {
    // Start with a board that has some empty cells below tokens
    const initialBoard = service['board']();

    // Manually create empty cells somewhere in a column to force tokens to drop
    // For example, clear cell at (2, 0) to let token at (1, 0) drop down
    const cellToClear = initialBoard.getCell(new Position(2, 0))!;
    const clearedResult = initialBoard.clearCells([cellToClear]);

    service['_board'].set(clearedResult.board);

    // Capture token IDs and positions before gravity
    const beforeBoard = service['board']();
    const beforeColumnCells = beforeBoard.getColumn(0);
    const beforePositions = beforeColumnCells.map(c => c.pos);
    const beforeTokenIds = beforeColumnCells.map(c => c.token?.id);

    // Apply gravity
    const changes = service.applyGravity();

    // Verify changes include token moves
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.every(c => c.type === 'token-moved' || c.type === 'token-spawned')).toBeTrue();

    // Capture after gravity state
    const afterBoard = service['board']();
    const afterColumnCells = afterBoard.getColumn(0);
    const afterPositions = afterColumnCells.map(c => c.pos);
    const afterTokenIds = afterColumnCells.map(c => c.token?.id);

    // Tokens should have moved down, so positions shifted "down" (increasing row)
    for (let i = 0; i < afterTokenIds.length; i++) {
      // Find where each token came from before
      const oldIndex = beforeTokenIds.indexOf(afterTokenIds[i]);
      if (oldIndex >= 0) {
        expect(afterPositions[i].row).toBeGreaterThanOrEqual(beforePositions[oldIndex].row);
      } else {
        // New tokens spawned, expect spawn changes
        expect(changes.some(change =>
          change.type === 'token-spawned' &&
          change.tokenId === afterTokenIds[i]
        )).toBeTrue();
      }
    }

    // Validate that token-moved changes have correct from and to positions
    for (const change of changes) {
      if (change.type === 'token-moved') {
        expect(change.from).toBeDefined();
        expect(change.to).toBeDefined();

        // Make sure the board tokens at these positions match
        const tokenAtFrom = afterBoard.getCell(change.from)!.token;
        const tokenAtTo = afterBoard.getCell(change.to)!.token;

        expect(tokenAtTo?.id).toBe(change.tokenId);
        // from cell is likely empty now or token has moved
        expect(tokenAtFrom?.id).not.toBe(change.tokenId);
      }
    }
  });



  it('should detect token clear in diffBoards', () => {
    const oldBoard = board;

    const oldCell = oldBoard.getCell(new Position(0, 0))!;

    // Clear token at (0, 0)
    const result = oldBoard.clearCells([oldCell]);
    const changes = service.diffBoards(oldBoard, result);

    expect(changes.some(change =>
      change.type === 'cell-cleared' &&
      change.position.equals(new Position(0, 0)) &&
      change.tokenId === oldCell.token?.id
    )).toBeTrue();
  });

  it('should detect token spawn in diffBoards', () => {
    const pos = new Position(1, 1);

    // Clear cell at position so we can spawn a new one
    const cellToClear = board.getCell(pos)!;
    const oldBoard = board.clearCells([cellToClear]).board;

    // Spawn new token at pos
    const newToken = EmojiToken.random();
    const newCell = oldBoard.getCell(pos)!.withToken(newToken);
    const result = oldBoard.updateCells([newCell]);

    const changes = service.diffBoards(oldBoard, result);

    expect(changes.some(change =>
      change.type === 'token-spawned' &&
      change.position.equals(new Position(1, 1)) &&
      change.tokenId === newToken.id &&
      change.kind === newToken.kind
    )).toBeTrue();
  });
});
