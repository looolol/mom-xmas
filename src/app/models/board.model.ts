import {Cell, CellType} from './cell.model';
import {Position} from './position.model';

export interface BoardConfig {
  rows: number;
  cols: number;
  layout?: CellType[][];
}

export function getCellType(row: number, col: number, layout?: CellType[][]): CellType {
  return layout?.[row]?.[col] ?? CellType.Normal
}


export class BoardState {
  constructor(
    public rows: number,
    public cols: number,
    public cells: Cell[]
  ) {}

  getIndex(pos: Position): number | undefined;
  getIndex(row: number, col: number): number | undefined;
  getIndex(arg1: number | Position, arg2?: number | Position): number | undefined {
    if (arg1 instanceof Position) {
      return arg1.row * this.cols + arg1.col;
    } else {
      if (typeof arg1 === 'number' && typeof arg2 === 'number') {
        return arg1 * this.cols + arg2;
      }
    }
    return undefined;
  }

  getCell(pos: Position): Cell | undefined;
  getCell(row: number, col: number): Cell | undefined;
  getCell(arg1: number | Position, arg2?: number): Cell | undefined {
    if (arg1 instanceof Position) {
      return this.getCell(arg1.row, arg1.col);
    } else {
       if (typeof arg1 === 'number' && typeof arg2 === 'number') {
        const pos = new Position(arg1, arg2);
        if (!pos.isValid(this.rows, this.cols)) return undefined;

        const idx = this.getIndex(arg1, arg2);
        if (idx === undefined) return undefined;
        return this.cells[idx];
      }
    }
    return undefined;
  }

  getColumn(col: number): Cell[] {
    const column: Cell[] = [];
    for (let row = 0; row < this.rows; row++) {
      const cell = this.getCell(row, col);
      if (cell) column.push(cell);
    }
    return column;
  }

  getRunLength(start: Position, delta: Position): number {
    const startCell = this.getCell(start);
    if (!startCell?.symbol) return 0;

    const baseKind = startCell.symbol.kind;
    let length = 1;

    let currentPos = start.add(delta);

    while (this.isValidPosition(currentPos)) {
      const cell = this.getCell(currentPos);
      if (!cell?.symbol || cell.symbol.kind !== baseKind) break;

      length++;
      currentPos = currentPos.add(delta);
    }

    return length;
  }

  isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols;
  }
}

export function getIndex(pos: Position, cols: number): number | undefined;
export function getIndex(row: number, col: number, cols: number): number | undefined;
export function getIndex(arg1: number | Position, arg2: number | Position, arg3?: number): number | undefined {
  if (arg1 instanceof Position && typeof arg2 === 'number') {
    return arg1.row * arg2 + arg1.col;
  } else {
    if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number') {
      return arg1 * arg3 + arg2;
    }
  }
  return undefined;
}

export function* allPositions(rows: number, cols: number): IterableIterator<Position> {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {  // <-- fixed here
      yield new Position(row, col);
    }
  }
}
