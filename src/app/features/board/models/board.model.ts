import {Cell, CellType} from './cell.model';
import {Position} from '../../../core/models/position.model';
import {EmojiToken, Token, TokenVisual} from './token';
import {Level} from '../../game/models/level.model';


export interface BoardConfig {
  rows: number;
  cols: number;
  layout?: CellType[][];
  tokenFactory?: TokenFactory;
}

export function getCellType(pos: Position, layout: CellType[][] | undefined) {
  return layout?.[pos.row]?.[pos.col] ?? CellType.Normal;
}


export class Board {
  constructor(
    public readonly rows: number,
    public readonly cols: number,
    public readonly cells: Cell[]
  ) {}

  /**
   * Get linear index in cells array from Position or (row, col)
   */
  getIndex(pos: Position): number | undefined;
  getIndex(row: number, col: number): number | undefined;
  getIndex(arg1: number | Position, arg2?: number | Position): number | undefined {
    if (arg1 instanceof Position) {
      if (!this.isValidPosition(arg1)) return undefined;
      return arg1.row * this.cols + arg1.col;
    }
    else if (typeof arg2 === 'number') {
      if (arg1 < 0 || arg1 >= this.rows || arg2 < 0 || arg2 >= this.cols) return undefined;
      return arg1 * this.cols + arg2;
    }
    return undefined;
  }

  /**
   * Get cell at Position or (row, col)
   */
  getCell(pos: Position): Cell | undefined;
  getCell(row: number, col: number): Cell | undefined;
  getCell(arg1: number | Position, arg2?: number): Cell | undefined {
    const index = (arg1 instanceof Position)
      ? this.getIndex(arg1)
      : this.getIndex(arg1 as number, arg2 as number);
    if (index === undefined) return undefined;
    return this.cells[index];
  }

  /**
   * Get all cells in a given column
   */
  getColumn(col: number): Cell[] {
    const column: Cell[] = [];
    for (let row = 0; row < this.rows; row++) {
      const cell = this.getCell(row, col);
      if (cell) column.push(cell);
    }
    return column;
  }

  /**
   * Get all cells in a given row
   */
  getRow(row: number): Cell[] {
    const rowCells: Cell[] = [];
    for (let col = 0; col < this.cols; col++) {
      const cell = this.getCell(row, col);
      if (cell) rowCells.push(cell);
    }
    return rowCells;
  }

  /**
   * Calculate run length of matching tokens from start position
   * moving along delta direction
   */
  getRunLength(start: Position, delta: Position): number {
    const startCell = this.getCell(start);
    if (!startCell?.token) return 0;

    const baseVisual = startCell.token.visual;
    let length = 1;
    let currentPos = start.add(delta);

    while (this.isValidPosition(currentPos)) {
      const cell = this.getCell(currentPos);
      if (!cell?.token || cell.token.visual !== baseVisual) break;

      length++;
      currentPos = currentPos.add(delta);
    }

    return length;
  }

  /**
   * Create a new Board with updated cells, replacing existing cells
   * matching updatedCells positions.
   */
  updateCells(updatedCells: Cell[]): Board {
    const newCells = this.cells.map(cell => {
      const updatedCell = updatedCells.find(c => c.pos.equals(cell.pos));
      return updatedCell ?? cell;
    });
    return new Board(this.rows, this.cols, newCells);
  }

  /**
   * Check if cell at pos has a token
   */
  hasTokenAt(pos: Position): boolean {
    return !!this.getCell(pos)?.token;
  }

  /**
   * Check if cell at pos is type Blocked
   */
  isBlockedAt(pos: Position): boolean {
    return this.getCell(pos)?.isBlocked() ?? false;
  }

  /**
   * Validate if position is within board bounds.
   */
  isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols;
  }

  /**
   */
  static createNewBoard(config: BoardConfig) {
    const cells: Cell[] = [];
    const tokenFactory = config.tokenFactory ?? (() => undefined);

    for (const pos of allPositions(config.rows, config.cols)) {
      const index = pos.row * config.cols + pos.col;
      const type = getCellType(pos, config.layout);

      // No token for blocked / null cells
      if (type === CellType.Blocked || type === CellType.Null) {
        cells.push(new Cell(pos, index, type));
        continue;
      }

      const token = tokenFactory(getExcludedTokens(pos, config.cols, cells));

      cells.push(new Cell(pos, index, type, token));
    }

    return new Board(config.rows, config.cols, cells);
  }

  static createFromLevel(level: Level): Board {
    return this.createNewBoard(level.boardConfig);
  }
}

export function* allPositions(rows: number, cols: number): IterableIterator<Position> {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {  // <-- fixed here
      yield new Position(row, col);
    }
  }
}

function getTokenVisualAt(pos: Position, cols: number, cells: Cell[]): TokenVisual | undefined{
  if (pos.row < 0 || pos.col < 0) return undefined;

  const index = pos.row * cols + pos.col;
  if (index >= cells.length) return undefined;

  return cells[index]?.token?.visual;
}

function getExcludedTokens(pos: Position, cols: number, cells: Cell[]) {
  const excludedTokens = new Set<TokenVisual>();

  // check left neighbors for horizontal match
  const left1 = getTokenVisualAt(new Position(pos.row, pos.col - 1), cols, cells);
  const left2 = getTokenVisualAt(new Position(pos.row, pos.col - 2), cols, cells);
  if (left1 && left2 && left1 === left2) {
    excludedTokens.add(left1);
  }

  // check up neighbors for vertical match
  const up1 = getTokenVisualAt(new Position(pos.row - 1, pos.col), cols, cells);
  const up2 = getTokenVisualAt(new Position(pos.row - 2, pos.col), cols, cells);
  if (up1 && up2 && up1 === up2) {
    excludedTokens.add(up1);
  }

  return excludedTokens
}


type TokenFactory = (excludedTokens: Set<TokenVisual>) => Token | undefined;

export const EmojiTokenFactory: TokenFactory = ((excludedTokens: Set<string>) => {
  return EmojiToken.random(excludedTokens);
});
