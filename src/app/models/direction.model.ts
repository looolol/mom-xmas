import {TILE_SIZE_PX} from '../utils/constants';
import {Cell} from './cell.model';

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export function oppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case Direction.UP: return Direction.DOWN;
    case Direction.DOWN: return Direction.UP;
    case Direction.LEFT: return Direction.RIGHT;
    case Direction.RIGHT: return Direction.LEFT;
  }
}

export const directionToOffset = (dir: Direction | undefined): { x: number; y: number } => {
  if (!dir) return { x: 0, y: 0 };

  switch (dir) {
    case Direction.UP: return { x: 0, y: -TILE_SIZE_PX }
    case Direction.DOWN: return { x: 0, y: TILE_SIZE_PX }
    case Direction.LEFT: return { x: -TILE_SIZE_PX, y: 0 }
    case Direction.RIGHT: return { x: TILE_SIZE_PX, y: 0 }
  }
}

export function getSwapDirection(a: Cell, b: Cell): Direction | null {
  const dx = b.col - a.col;
  const dy = b.row - a.row;

  console.log("getSwapDirection", dx, dy, a, b);

  if (dx === 1 && dy === 0) return Direction.RIGHT;
  if (dx === -1 && dy === 0) return Direction.LEFT;
  if (dx === 0 && dy === 1) return Direction.DOWN;
  if (dx === 0 && dy === -1) return Direction.UP;

  return null; // not adjacent
}
