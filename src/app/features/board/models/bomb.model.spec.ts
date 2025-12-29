import {Board} from './board.model';
import {LEVEL_1} from '../../game/levels/level1';
import {Bomb} from './bomb.model';
import {Position} from '../../../core/models/position.model';


describe('Bomb', () => {
  let board: Board;


  beforeEach(() => {
    board = Board.createFromLevel(LEVEL_1)
  });

  describe('constructor', () => {
    it('should clamp negative radius to zero', () => {
      const bomb = new Bomb(board, -5);
      expect(bomb.getRadius()).toBe(0);
    });

    it('should accept valid center position', () => {
      const center = new Position(1, 1);
      const bomb = new Bomb(board, 1, center);
      expect(bomb.getCenter()).toEqual(center);
    });

    it('should throw if no valid center can be determined', () => {
      board = new Board({rows: 0, cols: 0}, []);
      expect(() => new Bomb(board, 1)).toThrowError('Cannot determine a valid bomb center.');
    });
  });

  describe('getRandomCenter', () => {
    it('returns a center position that can fully detonate the bomb when possible', () => {
      const radius = 1;
      const bomb = new Bomb(board, radius);
      const center = bomb.getCenter();

      // test 4 corners of bomb to see if they are valid
      expect(board.isValidPosition(new Position(center.row - radius, center.col - radius))).toBeTrue();
      expect(board.isValidPosition(new Position(center.row - radius, center.col + radius))).toBeTrue();

      expect(board.isValidPosition(new Position(center.row + radius, center.col - radius))).toBeTrue();
      expect(board.isValidPosition(new Position(center.row + radius, center.col + radius))).toBeTrue();
    });

    it('falls back to any token position if no full bomb area possible', () => {
      const radius = 20; // big radius
      const bomb = new Bomb(board, radius);
      const center = bomb.getCenter();

      expect(board.isValidPosition(center)).toBeTrue();

      const centerCell = board.getCell(center);
      expect(centerCell?.hasToken()).toBeTrue();
    });
  });

  describe('getters', () => {
    it('radius returns the correct radius', () => {
      const bomb = new Bomb(board, 3);
      expect(bomb.getRadius()).toBe(3);
    });

    it('center returns the correct valid center', () => {
      const center = new Position(0, 0);
      const bomb = new Bomb(board, 1, center);
      expect(bomb.getCenter()).toEqual(center);
    });
  });

  describe('getArea', () => {
    it('returns correct bomb area cells for given center and radius', () => {
      const radius = 1;
      const center = new Position(2, 2);

      const bomb = new Bomb(board, radius, center);
      const area = bomb.getArea();

      expect(area.length).toBe(9);

      for (const cell of area) {
        expect(cell.pos.row).toBeGreaterThanOrEqual(center.row - radius);
        expect(cell.pos.row).toBeLessThanOrEqual(center.row + radius);
        expect(cell.pos.col).toBeGreaterThanOrEqual(center.col - radius);
        expect(cell.pos.col).toBeLessThanOrEqual(center.col + radius);
        expect(cell.hasToken()).toBeTrue();
      }
    });

    it('handles edge centers gracefully (partial bomb area)', () => {
      const radius = 1;
      const center = new Position(0, 0); // top left corner

      const bomb = new Bomb(board, radius, center);
      const area = bomb.getArea();

      expect(area.length).toBe(4);

      for (const cell of area) {
        expect(cell.pos.row).toBeGreaterThanOrEqual(center.row - radius);
        expect(cell.pos.row).toBeLessThanOrEqual(center.row + radius);
        expect(cell.pos.col).toBeGreaterThanOrEqual(center.col - radius);
        expect(cell.pos.col).toBeLessThanOrEqual(center.col + radius);
        expect(cell.hasToken()).toBeTrue();
      }
    });

    it('uses random center if invalid center provided in constructor', () => {
      const radius = 1;
      const invalidCenter = new Position(-1, -1);

      const bomb = new Bomb(board, radius, invalidCenter);

      expect(bomb.getCenter()).not.toEqual(invalidCenter);
      expect(board.isValidPosition(bomb.getCenter())).toBeTrue();

      const area = bomb.getArea();
      expect(area.length).toBeGreaterThan(0);
      for (const cell of area) {
        expect(cell.hasToken()).toBeTrue();
      }
    });
  });
});
