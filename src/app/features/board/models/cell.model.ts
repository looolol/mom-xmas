import {Token, TokenVisual} from './token';
import {Position} from '../../../core/models/position.model';
import {getRandomFrom} from '../../../core/utils/random';

export enum CellType {
  Normal = 0,
  Blocked = 1,
  Null = 2,
}

export function getRandomCellType(): CellType {
  const values = Object.values(CellType);
  return getRandomFrom(values) as CellType;
}

export function isCellTypeUseable(type: CellType): boolean {
  return type !== CellType.Blocked && type !== CellType.Null;
}

export class Cell {

  constructor(
    public readonly pos: Position,
    public readonly index: number,
    public readonly type: CellType,
    public readonly token?: Token,
  ) { }

  hasToken(): this is Cell & { token: Token } {
    return !!this.token;
  }

  get tokenVisual(): TokenVisual | undefined {
    return this.token?.visual;
  }

  withToken(token: Token | undefined): Cell {
    return new Cell(this.pos, this.index, this.type, token);
  }

  withType(type: CellType) {
    return new Cell(this.pos, this.index, type, this.token);
  }

  isAdjacent(other: Cell): boolean {
    const diff = this.pos.sub(other.pos).abs();
    return (diff.row === 1 && diff.col === 0) || (diff.row === 0 && diff.col === 1);
  }
}
