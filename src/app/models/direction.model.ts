import {TILE_SIZE_PX} from '../utils/constants';
import {Position} from './position.model';

export enum Dir {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export class Direction {
  public displayOffset: Position;

  constructor(
    public name: Dir,
    public delta: Position,
    public opposite: Dir
  ) {
    this.displayOffset = new Position(delta.row * TILE_SIZE_PX, delta.col * TILE_SIZE_PX);
  }

  static fromName(name: Dir): Direction {
    return Directions[name];
  }

  addTo(pos: Position, steps = 1): Position {
    return pos.add(this.delta.multiply(steps));
  }
}

export const Directions: Record<Dir, Direction> = {
  [Dir.UP]: new Direction(Dir.UP, new Position(-1, 0), Dir.DOWN),
  [Dir.DOWN]: new Direction(Dir.DOWN, new Position(1, 0), Dir.UP),
  [Dir.LEFT]: new Direction(Dir.LEFT, new Position(0, -1), Dir.RIGHT),
  [Dir.RIGHT]: new Direction(Dir.RIGHT, new Position(0, 1), Dir.LEFT)
}

export function getOppositeDirection(direction: Direction | undefined): Direction | undefined {
  if (!direction) return undefined;
  return Directions[direction.opposite];
}

export function getDirectionDelta(dir: Dir): Position {
  return Directions[dir].delta;
}

export function getDirectionDisplayOffset(direction: Direction | undefined): { x: string; y: string } | undefined {
  if (!direction) return undefined;

  return {
    x: `${direction.displayOffset.col}px`,
    y: `${direction.displayOffset.row}px`,
  }
}

export function getSwapDirection(a: Position, b: Position): Direction | undefined {
  const delta = new Position(b.row - a.row, b.col - a.col);

  for (const dir of Object.values(Directions)) {
    if (dir.delta.equals(delta)) {
      return dir;
    }
  }
  return undefined;
}

export function movePosition(pos: Position, dirName: Dir, steps = 1): Position {
  const dir = Directions[dirName];
  return pos.add(dir.delta.multiply(steps));
}
