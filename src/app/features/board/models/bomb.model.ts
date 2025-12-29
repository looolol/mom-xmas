import {Board} from './board.model';
import {Position} from '../../../core/models/position.model';
import {getRandomFrom} from '../../../core/utils/random';
import {Cell} from './cell.model';

export class Bomb {

  private readonly center: Position;

  /**
   * @param board
   * @param radius
   * Radius of the bomb size, ex: 1 = 3x3, 2 = 5x5
   * @param center
   * Optional center of the bomb.
   * If not valid or not provided, will pick random
   */
  constructor(
    private readonly board: Board,
    private readonly radius: number = 1,
    center?: Position
  ) {
    this.radius = radius < 0 ? 0 : radius;

    if (center && this.board.isValidPosition(center)) {
      this.center = center;
    } else {
      const randomCenter = this.getRandomCenter();
      if (!randomCenter) {
        throw new Error('Cannot determine a valid bomb center.');
      }
      this.center = randomCenter;
    }
  }

  /**
   * Returns the radius of the bomb
   */
  getRadius(): number {
    return this.radius;
  }

  /**
   * Returns the center Position of the bomb
   */
  getCenter(): Position {
    return this.center;
  }

  /**
   * Gets cells in bomb area
   */
  getArea(): Cell[] {
    const bombArea: Cell[] = [];

    for (let r = this.center.row - this.radius; r <= this.center.row + this.radius; r++) {
      for (let c = this.center.col - this.radius; c <= this.center.col + this.radius; c++) {
        const cell = this.board.getCell(r, c);
        if (cell && cell.hasToken()) {
          bombArea.push(cell);
        }
      }
    }

    return bombArea;
  }

  /**
   * Returns a random valid center for the bomb on the board.
   * If possible, will only create a bomb that fully detonates
   * (no wasted cells).
   * If not possible, return a random position from the board
   */
  getRandomCenter(): Position | undefined {
    const candidates: Position[] = [];

    for (let row = this.radius; row <= this.board.rows - 1 - this.radius; row++) {
      for (let col = this.radius; col <= this.board.cols - 1 - this.radius; col++) {
        const cell = this.board.getCell(row, col);
        if (cell?.hasToken()) {
          candidates.push(cell.pos);
        }
      }
    }

    if (candidates.length === 0) {
      if (this.board.cells.length === 0) return undefined;
      const cellCandidates = this.board.cells
        .filter(c => c.hasToken())
        .map(c => c.pos);
      return getRandomFrom(cellCandidates);
    }

    return getRandomFrom(candidates);
  }
}
