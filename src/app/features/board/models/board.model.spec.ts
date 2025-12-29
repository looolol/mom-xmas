import {Board} from './board.model';
import {LEVEL_1} from '../../game/levels/level1';
import {Cell, CellType} from './cell.model';
import {Position} from '../../../core/models/position.model';
import {EmojiToken} from './token';

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
    const nonBlockedCells = board.cells.filter(c => c.type !== CellType.Blocked && c.type !== CellType.Null);
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
  let board: Board;

  beforeEach(() => {
    board = Board.createFromLevel(LEVEL_1);
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

  function createTestBoardWithHorizontalRun(): Board {
    const rows = 3;
    const cols = 5;
    const cells: Cell[] = [];

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

    return new Board(rows, cols, cells);
  }

  it('getRunLength should return correct run length on controlled board', () => {
    const testBoard = createTestBoardWithHorizontalRun();

    expect(testBoard.getRunLength(new Position(0, 0), new Position(0, 1))).toBe(3);
    expect(testBoard.getRunLength(new Position(0, 0), new Position(1, 0))).toBe(1);
  });

  it ('updatesCells should update specified cells and keep others unchanged', () => {
    const cellToUpdate = board.cells[0];
    const newToken = cellToUpdate.token ? cellToUpdate.token : EmojiToken.random();
    const updatedCell = cellToUpdate.withToken(newToken);
    const updatedBoard = board.updateCells([updatedCell]);

    expect(updatedBoard.cells[0]).toEqual(updatedCell);
    expect(updatedBoard.cells[1]).toEqual(board.cells[1]);
  });

  it('hasTokenAt should return true if token exists at position', () => {
    const cellWithToken = board.cells.find(c => c.token);
    if (!cellWithToken) return;

    expect(board.hasTokenAt(cellWithToken.pos)).toBeTrue();
    expect(board.hasTokenAt(new Position(-1, -1))).toBeFalse();
  });

  it('isBlockedAt should return true for blocked cells', () => {
    const blockedCell = board.cells.find(c => c.type === CellType.Blocked);
    if (!blockedCell) return;

    expect(board.isBlockedAt(blockedCell.pos)).toBeTrue();
    expect(board.isBlockedAt(new Position(-1, -1))).toBeFalse();
  });

  it('isValidPosition should validate position bounds correctly', () => {
    expect(board.isValidPosition(new Position(0, 0))).toBeTrue();
    expect(board.isValidPosition(new Position(board.rows - 1, board.cols - 1))).toBeTrue();

    expect(board.isValidPosition(new Position(-1, 0))).toBeFalse();
    expect(board.isValidPosition(new Position(0, -1))).toBeFalse();
    expect(board.isValidPosition(new Position(board.rows, 0))).toBeFalse();
    expect(board.isValidPosition(new Position(0, board.cols))).toBeFalse();
  });


});
