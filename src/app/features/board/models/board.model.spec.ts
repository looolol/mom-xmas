import {Board, BoardConfig, EmojiTokenFactory} from './board.model';
import {LEVEL_1} from '../../game/levels/level1';
import {Cell, CellType, isCellTypeUseable} from './cell.model';
import {Position} from '../../../core/models/position.model';
import {EmojiToken} from './token';
import {Dir} from '../../../core/models/direction.model';

describe('Board Creation from Level', () => {
  let board: Board;

  beforeEach(() => {
    board = Board.createFromLevel(LEVEL_1);
  });


  it('should create board with correct dimensions', () => {
    expect(board).toBeDefined();
    expect(board.rows).toBe(LEVEL_1.boardConfig.rows);
    expect(board.cols).toBe(LEVEL_1.boardConfig.cols);
    expect(board.cells.length).toBe(board.rows * board.cols);
  });

  it ('should have valid cells with proper positions', () => {
    for (const cell of board.cells) {
      expect(cell.pos.row).toBeGreaterThanOrEqual(0);
      expect(cell.pos.row).toBeLessThan(board.rows);

      expect(cell.pos.col).toBeGreaterThanOrEqual(0);
      expect(cell.pos.col).toBeLessThan(board.cols);

      const expectedIndex = cell.pos.row * board.cols + cell.pos.col;
      expect(cell.index).toBe(expectedIndex);
    }
  });

  it('should not place tokens on blocked or null cells', () => {
    for (const cell of board.cells) {
      if (cell.type === CellType.Blocked || cell.type === CellType.Null) {
        expect(cell.token).toBeUndefined();
      }
    }
  });

  it('should place tokens on non-blocked cells', () => {
    const nonBlockedCells = board.cells.filter(c => isCellTypeUseable(c.type));
    const tokensCount = nonBlockedCells.filter(c => !!c.token).length;
    expect(tokensCount).toBeGreaterThan(0);
  });

  it ('should create a board with no initial matching runs of 3 or more tokens', () => {
    // Helper to check horizontal and vertical runs of 3+
    function hasMatch(board: Board): boolean {
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          const pos = new Position(row, col);

          // Skip if no token
          const cell = board.getCell(pos);
          if (!cell?.token) continue;

          const tokenVisual = cell.token.visual;

          // Check horizontal run length starting here
          let count = 1;
          for (let c = col + 1; c < board.cols; c++) {
            const nextCell = board.getCell(row, c);
            if (nextCell?.token?.visual === tokenVisual) count++;
            else break;
          }
          if (count >= 3) return true;

          // Check vertical run length starting here
          count = 1;
          for (let r = row + 1; r < board.rows; r++) {
            const nextCell = board.getCell(r, col);
            if (nextCell?.token?.visual === tokenVisual) count++;
            else break;
          }
          if (count >= 3) return true;
        }
      }
      return false;
    }

    expect(hasMatch(board)).toBeFalse();
  });
});

describe('Board', () => {
  let config: BoardConfig;
  let board: Board;

  function createTestBoardWithHorizontalRun(): Board {
    const rows = 3;
    const cols = 5;
    const cells: Cell[] = [];

    const config: BoardConfig = {
      rows: rows,
      cols: cols,
      tokenFactory: EmojiTokenFactory
    }

    // Create a token to use for the run
    const runToken = new EmojiToken('😀');

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pos = new Position(row, col);
        const index = row * cols + col;
        let token: EmojiToken | undefined;

        // Create a horizontal run of 3 tokens at row 0, col 0..2
        if (row === 0 && col >= 0 && col <= 2) {
          token = runToken;
        } else {
          // Different token for others to avoid accidental matches
          token = new EmojiToken('😎');
        }

        cells.push(new Cell(pos, index, CellType.Normal, token));
      }
    }

    return new Board(config, cells);
  }


  beforeEach(() => {
    config = LEVEL_1.boardConfig;
    board = Board.createFromLevel(LEVEL_1);
  });

  it('rows should return correct number of rows', () => {
    expect(board.rows).toBeDefined();
    expect(board.rows).toEqual(config.rows);
  });

  it('cols should return correct number of cols', () => {
    expect(board.cols).toBeDefined();
    expect(board.cols).toEqual(config.cols);
  });

  it('hasTokenAt should return true if token exists at position', () => {
    const cellWithToken = board.cells.find(c => c.token);
    if (!cellWithToken) return;

    expect(board.hasTokenAt(cellWithToken.pos)).toBeTrue();
    expect(board.hasTokenAt(new Position(-1, -1))).toBeFalse();
  });

  it('hasMatches should return false on a blank board with no matches', () => {
    expect(board.hasMatches()).toBeFalse();
  });

  it('hasMatches should return true on a board with a match', () => {
    const testBoard = createTestBoardWithHorizontalRun();
    expect(testBoard.hasMatches()).toBeTrue();
  });

  it('isValidPosition should validate position bounds correctly', () => {
    expect(board.isValidPosition(new Position(0, 0))).toBeTrue();
    expect(board.isValidPosition(new Position(board.rows - 1, board.cols - 1))).toBeTrue();

    expect(board.isValidPosition(new Position(-1, 0))).toBeFalse();
    expect(board.isValidPosition(new Position(0, -1))).toBeFalse();
    expect(board.isValidPosition(new Position(board.rows, 0))).toBeFalse();
    expect(board.isValidPosition(new Position(0, board.cols))).toBeFalse();
  });


  it('getIndex should return correct linear index or undefined if valid', () => {
    expect(board.getIndex(new Position(0, 0))).toBe(0);
    expect(board.getIndex(0, 0)).toBe(0);

    expect(board.getIndex(new Position(board.rows - 1, board.cols - 1)))
      .toBe((board.rows - 1) * board.cols + (board.cols - 1));

    expect(board.getIndex(-1, 0)).toBeUndefined();
    expect(board.getIndex(board.rows, 0)).toBeUndefined();
    expect(board.getIndex(0, -1)).toBeUndefined();
    expect(board.getIndex(0, board.cols)).toBeUndefined();
  });

  it('getCell should return correct cell or undefined if invalid', () => {
    const cell = board.getCell(0, 0);
    expect(cell).toBeDefined();
    expect(cell?.pos.row).toBe(0);
    expect(cell?.pos.col).toBe(0);

    expect(board.getCell(-1, 0)).toBeUndefined();
    expect(board.getCell(board.rows, 0)).toBeUndefined();
    expect(board.getCell(0, -1)).toBeUndefined();
    expect(board.getCell(0, board.cols)).toBeUndefined();
  });

  it ('getRow should return correct cells for a given row', () => {
    const row = 2;
    const rowCells = board.getRow(row);
    expect(rowCells.length).toBe(board.cols);
    for (const cell of rowCells) {
      expect(cell.pos.row).toBe(row);
    }
  });

  it('getColumn should return correct cells for a given column', () => {
    const col = 3;
    const colCells = board.getColumn(col);
    expect(colCells.length).toBe(board.rows);
    for (const cell of colCells) {
      expect(cell.pos.col).toBe(col);
    }
  });

  it('getRunLength should return correct run length on controlled board', () => {
    const testBoard = createTestBoardWithHorizontalRun();

    expect(testBoard.getRunLength(new Position(0, 0), new Position(0, 1))).toBe(3);
    expect(testBoard.getRunLength(new Position(0, 0), new Position(1, 0))).toBe(1);
  });

  it('getNewCells should return empty array if no new tokens', () => {
    const newTokens = board.getNewTokens(board);
    expect(newTokens.length).toBe(0);
  });

  it ('getNewCells should return cells with tokens that are new compared to old board', () => {
    const oldBoard = board;

    const cellToUpdate = board.cells.find(c => c.hasToken());
    expect(cellToUpdate).toBeDefined();

    const newToken = EmojiToken.random(new Set());
    const updatedCell = cellToUpdate!.withToken(newToken);
    const newCells = [updatedCell];

    const newBoard = board.updateCells(newCells).board;
    const newTokens = newBoard.getNewTokens(board);

    expect(newTokens.length).toBe(1);
    expect(newTokens[0].pos).toEqual(updatedCell.pos);
    expect(newTokens[0].token!.id).toBe(newToken.id);
  });

  it('getNewCells should not consider cells without tokens as  new tokens', () => {
    const clearedCell = board.cells.find(c => c.hasToken());
    expect(clearedCell).toBeDefined();

    const updatedCell = clearedCell!.withToken(undefined);
    const newBoard = board.updateCells([updatedCell]).board;

    const newTokens = newBoard.getNewTokens(board);
    expect(newTokens.length).toBe(0);
  });

  it ('updatesCells should update specified cells and keep others unchanged', () => {
    const cellToUpdate = board.cells[0];
    const newToken = cellToUpdate.token ? cellToUpdate.token : EmojiToken.random();
    const updatedCell = cellToUpdate.withToken(newToken);
    const updatedBoard = board.updateCells([updatedCell]).board;

    expect(updatedBoard.cells[0]).toEqual(updatedCell);
    expect(updatedBoard.cells[1]).toEqual(board.cells[1]);
  });

  it('swapCells should swap tokens between two cells', () => {
    const cellA = board.cells[0];
    const cellB = board.cells[1];

    const result = board.swapCells(cellA, cellB);
    const swappedBoard = result.board;

    expect(swappedBoard.getCell(cellA.pos)?.token).toEqual(cellB.token);
    expect(swappedBoard.getCell(cellB.pos)?.token).toEqual(cellA.token);

    const changes = result.changes;
    expect(changes.length).toBe(2);
    expect(changes[0].token!.equals(cellB.token)).toBeTrue();
    expect(changes[1].token!.equals(cellA.token)).toBeTrue();
  });

  it('rotateRow should rotate tokens left and right', () => {
    const row = 0;
    const originalTokens = board.getRow(row).map(c => c.token);

    const rotatedLeft = board.rotateRow(row, Dir.LEFT).board;
    const rotatedLeftTokens = rotatedLeft.getRow(row).map(c => c.token);
    expect(rotatedLeftTokens).toEqual([...originalTokens.slice(1), originalTokens[0]]);

    const rotatedRight = board.rotateRow(row, Dir.RIGHT).board;
    const rotatedRightTokens = rotatedRight.getRow(row).map(c => c.token);
    expect(rotatedRightTokens).toEqual([originalTokens[originalTokens.length - 1], ...originalTokens.slice(0, -1)]);
  });

  it('shuffleBoard should shuffle tokens but keep token count same', () => {
    const tokensBefore = board.cells.filter(c => c.hasToken()).map(c => c.token);
    const shuffledBoard = board.shuffleBoard().board;
    const tokensAfter = shuffledBoard.cells.filter(c => c.hasToken()).map(c => c.token);

    expect(tokensAfter.length).toBe(tokensBefore.length);

    // Sort token IDs to compare content ignoring order
    const idsBefore = tokensBefore.map(t => t.id).sort();
    const idsAfter = tokensAfter.map(t => t.id).sort();
    expect(idsAfter).toEqual(idsBefore);
  });

  it('applyGravity should drop tokens and add new tokens at top', () => {
    // clear first 3 in second column, top row has to drop
    const clearedCells = [
      board.getCell(1, 0)!,
      board.getCell(1, 1)!,
      board.getCell(1, 2)!,
    ];
    const clearedBoard = board.clearCells(clearedCells).board;

    const gravityApplied = clearedBoard.applyGravity().board;

    const originalTokenCount = board.cells.filter(c => c.hasToken()).length;
    const newTokenCount = gravityApplied.cells.filter(c => c.hasToken()).length;

    expect(newTokenCount).toBe(originalTokenCount);

    // now check if top 3 fell down
    const oldTopRow = board.cells.slice(0, 3);
    const oldTopRowAfterGravity = gravityApplied.cells.slice(config.cols, config.cols + 3);
    const newTopRow = gravityApplied.cells.slice(0, 3);
    for (let i = 0; i < oldTopRow.length; i++) {
     expect(oldTopRow[i].token).toEqual(oldTopRowAfterGravity[i].token);
     expect(newTopRow[i].token).not.toEqual(oldTopRow[i].token);
     expect(oldTopRowAfterGravity[i].token).not.toEqual(newTopRow[i].token);
    }
  });

});
