import {Token, TokenVisual} from './token';
import {Position} from '../../../core/models/position.model';

export enum CellType {
  Normal = 0,
  Blocked = 1,
  Null = 2,
}

export function getRandomCellType(): CellType {
  const values = Object.values(CellType);
  return values[Math.floor(Math.random() * values.length)] as CellType;
}

export class Cell {

  constructor(
    public readonly pos: Position,
    public readonly index: number,
    public readonly type: CellType,
    public readonly token?: Token,
  ) { }

  isBlocked(): boolean {
    return this.type === CellType.Blocked;
  }

  hasToken(): boolean {
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
