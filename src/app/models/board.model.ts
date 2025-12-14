import {Cell, CellType} from './cell.model';

export interface BoardConfig {
  rows: number;
  cols: number;
  layout?: CellType[][];
}

export interface BoardState {
  rows: number;
  cols: number;
  cells: Cell[];
}
