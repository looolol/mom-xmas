import { SymbolModel } from './symbol.model';
import {Position} from './position.model';

export enum CellType {
  Normal = 0,
  Blocked = 1,
  Null = 2,
}

const cellTypes = Object.values(CellType)
    .filter(v => typeof v === 'number') as number[];

export function getRandomCellType(): number {
  const index = Math.floor(Math.random() * cellTypes.length);
  return cellTypes[index];
}

export class Cell {
  constructor(
    public pos: Position,
    public index: number,
    public type: CellType,
    public symbol?: SymbolModel,
  ) { }

  isBlocked(): this is { symbol: SymbolModel} {
    return this.type === CellType.Blocked;
  }

  hasSymbol(): boolean {
    return !!this.symbol;
  }

  getSymbolKind(): string | undefined {
    return this.symbol?.kind;
  }

  withSymbol(symbolModel: SymbolModel | undefined): Cell {
    return new Cell(this.pos, this.index, this.type, symbolModel);
  }

  isAdjacent(other: Cell): boolean {
    const diff = this.pos.sub(other.pos).abs();
    return (diff.row === 1 && diff.col === 0) || (diff.row === 0 && diff.col === 1);
  }
}
