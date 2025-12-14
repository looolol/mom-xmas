import { SymbolModel } from './symbol.model';

export enum CellTypeEnum {
  Normal = 0,
  Blocked = 1,
  Null = 2,
}

export type CellType = keyof typeof CellTypeEnum | (typeof CellTypeEnum)[keyof typeof CellTypeEnum];

export interface Cell {
  row: number;
  col: number;
  index: number;
  type: CellType;
  symbol: SymbolModel | null;
}
