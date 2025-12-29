import {Cell, CellType, getRandomCellType} from './cell.model';
import { Position } from '../../../core/models/position.model';
import { EmojiToken } from './token';  // or any Token subclass you have

describe('Cell', () => {
  const pos = new Position(2, 3);
  const index = 23;
  const token = new EmojiToken('😀');

  it('should create cell with correct properties', () => {
    const cell = new Cell(pos, index, CellType.Normal, token);
    expect(cell.pos).toBe(pos);
    expect(cell.index).toBe(index);
    expect(cell.type).toBe(CellType.Normal);
    expect(cell.token).toBe(token);
  });

  it('hasToken returns true if token exists', () => {
    expect(new Cell(pos, index, CellType.Normal, token).hasToken()).toBeTrue();
    expect(new Cell(pos, index, CellType.Normal).hasToken()).toBeFalse();
  });

  it('tokenVisual returns the token visual if token exists', () => {
    const cell = new Cell(pos, index, CellType.Normal, token);
    expect(cell.tokenVisual).toBe(token.visual);

    const emptyCell = new Cell(pos, index, CellType.Normal);
    expect(emptyCell.tokenVisual).toBeUndefined();
  });

  it('withToken returns a new Cell with updated token', () => {
    const cell = new Cell(pos, index, CellType.Normal);
    const newCell = cell.withToken(token);
    expect(newCell).not.toBe(cell);
    expect(newCell.token).toBe(token);
    expect(newCell.pos).toBe(cell.pos);
    expect(newCell.index).toBe(cell.index);
    expect(newCell.type).toBe(cell.type);
  });

  it('withType returns a new Cell with updated type', () => {
    const cell = new Cell(pos, index, CellType.Normal, token);
    const newCell = cell.withType(CellType.Blocked);
    expect(newCell).not.toBe(cell);
    expect(newCell.type).toBe(CellType.Blocked);
    expect(newCell.token).toBe(cell.token);
    expect(newCell.pos).toBe(cell.pos);
    expect(newCell.index).toBe(cell.index);
  });

  describe('isAdjacent', () => {
    it('returns true for adjacent cells horizontally', () => {
      const cell1 = new Cell(new Position(1, 1), 0, CellType.Normal);
      const cell2 = new Cell(new Position(1, 2), 1, CellType.Normal);
      expect(cell1.isAdjacent(cell2)).toBeTrue();
    });

    it('returns true for adjacent cells vertically', () => {
      const cell1 = new Cell(new Position(2, 3), 0, CellType.Normal);
      const cell2 = new Cell(new Position(3, 3), 1, CellType.Normal);
      expect(cell1.isAdjacent(cell2)).toBeTrue();
    });

    it('returns false for diagonal neighbors', () => {
      const cell1 = new Cell(new Position(1, 1), 0, CellType.Normal);
      const cell2 = new Cell(new Position(2, 2), 1, CellType.Normal);
      expect(cell1.isAdjacent(cell2)).toBeFalse();
    });

    it('returns false for cells not adjacent', () => {
      const cell1 = new Cell(new Position(1, 1), 0, CellType.Normal);
      const cell2 = new Cell(new Position(3, 3), 1, CellType.Normal);
      expect(cell1.isAdjacent(cell2)).toBeFalse();
    });
  });
});

describe('getRandomCellType', () => {
  it('should return a valid CellType enum value', () => {
    const cellType = getRandomCellType();
    expect(Object.values(CellType)).toContain(cellType);
  });

  it('should return all CellType values over multiple calls', () => {
    const results = new Set<CellType>();
    for (let i = 0; i < 100; i++) {
      results.add(getRandomCellType());
    }
    Object.values(CellType).forEach(value => {
      expect(results.has(value as CellType)).toBeTrue();
    });
  });
});
