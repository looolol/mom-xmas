import {Cell, CellType, isCellTypeUseable} from './cell.model';
import {Position} from '../../../core/models/position.model';
import {EmojiToken, Token, TokenVisual} from './token';
import {Level} from '../../game/models/level.model';
import {Dir, getDirectionDelta} from '../../../core/models/direction.model';
import {getRandomInt} from '../../../core/utils/random';
import {BoardResult} from './board.result.model';


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
  public readonly tokenFactory: TokenFactory;

  constructor(
    public readonly config: BoardConfig,
    public readonly cells: Cell[]
  ) {
    this.tokenFactory = config.tokenFactory ?? (() => undefined);
  }

  /**
   * --- Board Helpers ---
   */

  /**
   * returns number of rows from config
   */
  get rows(): number {
    return this.config.rows;
  }

  /**
   * returns number of cols from config
   */
  get cols(): number {
    return this.config.cols;
  }

  /**
   * Check if cell at pos has a token
   */
  hasTokenAt(pos: Position): boolean {
    return this.getCell(pos)?.hasToken() ?? false;
  }

  /**
   * Checks if there are any matches present in board
   */
  hasMatches(): boolean {
    return this.findMatches().length > 0;
  }

  /**
   * Validate if position is within board bounds.
   */
  isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols;
  }

  /**
   * Gets cell index from Position or (row, col)
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
    if (!startCell?.hasToken()) return 0;

    const baseVisual = startCell.tokenVisual;
    let length = 1;
    let currentPos = start.add(delta);

    while (this.isValidPosition(currentPos)) {
      const cell = this.getCell(currentPos);
      if (!cell?.hasToken() || cell.tokenVisual !== baseVisual) break;

      length++;
      currentPos = currentPos.add(delta);
    }

    return length;
  }

  /**
   * Returns all matches in a direction
   */
  findMatchesInDirection(delta: Position): Set<Cell> {
    const matchedCells = new Set<Cell>();

    for (const cell of this.cells) {
      if (!cell.hasToken()) continue;

      const prevPos = cell.pos.add(delta.multiply(-1));
      const prevCell = this.getCell(prevPos);
      if (prevCell?.tokenVisual === cell.tokenVisual) continue;

      const runLength = this.getRunLength(cell.pos, delta);

      if (runLength >= 3) {
        for (let i = 0; i < runLength; i++) {
          const matchPos = cell.pos.add(delta.multiply(i));
          const matchCell = this.getCell(matchPos);
          if (matchCell) matchedCells.add(matchCell);
        }
      }
    }

    return matchedCells;
  }

  /**
   * Finds all matches on the board
   */
  findMatches(): Cell[] {
    const horizontalMatches = this.findMatchesInDirection(getDirectionDelta(Dir.RIGHT));
    const verticalMatches = this.findMatchesInDirection(getDirectionDelta(Dir.DOWN));

    const allMatches = new Set<Cell>([ ...horizontalMatches, ...verticalMatches ]);
    return Array.from(allMatches);
  }

  /**
   * Compares this to an old board state and returns cells with new tokens.
   * Useful to help animate those new tokens
   */
  getNewTokens(oldBoard: Board): Cell[] {
    const oldTokenIds = new Set<string>();

    for (const cell of oldBoard.cells) {
      if (cell.token) oldTokenIds.add(cell.token.id);
    }

    return this.cells.filter(cell => {
      return cell.token && !oldTokenIds.has(cell.token.id);
    });
  }


  /**
   * --- Board Transformations ---
   */

  /**
   * Create a new Board with updated cells, replacing existing cells
   * matching updatedCells positions.
   */
  updateCells(updatedCells: Cell[]): BoardResult {
    const updatedMap = new Map(updatedCells.map(c => [c.index, c]));
    const newCells = this.cells.map(cell => updatedMap.get(cell.index) ?? cell);
    const newBoard = this.withCells(newCells);
    return { board: newBoard, changes: updatedCells };
  }

  /**
   * Create new board with cell a and b's tokens swapped
   */
  swapCells(a: Cell, b: Cell): BoardResult {
    const newCells = [
      a.withToken(b.token),
      b.withToken(a.token),
    ];
    return this.updateCells(newCells);
  }

  /**
   * Create new board where all cells marked to clear
   * have their tokens removed
   */
  clearCells(cellsToClear: Cell[]): BoardResult {
    if (cellsToClear.length === 0) return {board: this, changes: []};

    const newCells = cellsToClear.map(c => c.withToken(undefined));
    return this.updateCells(newCells);
  }

  /**
   * Returns a new Board where a row has been rotated one cell cw or ccw
   */
  rotateRow(row: number, dir: Dir.LEFT | Dir.RIGHT): BoardResult {
    const rowCells = this.getRow(row);
    const tokens = rowCells.map(c => c.token);

    const rotated =
      dir === Dir.LEFT
        ? [...tokens.slice(1), tokens[0]]
        : [tokens[tokens.length - 1], ...tokens.slice(0, -1)];

    const updated = rowCells.map((cell, i) =>
      cell.withToken(rotated[i])
    );

    return this.updateCells(updated);
  }

  /**
   * Returns a new board with all the Tokens shuffled
   */
  shuffleBoard(): BoardResult {
    const tokens = this.cells
      .filter(cell => cell.hasToken())
      .map(cell => cell.token!);

    for (let i = tokens.length - 1; i > 0; i--) {
      // shuffle with any index from 0 to i
      const j = getRandomInt(0, i + 1);
      [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
    }

    const newCells = this.cells.map(cell => {
      if (cell.hasToken()) {
        const newToken = tokens.pop()!;
        return cell.withToken(newToken);
      }
      return cell;
    });

    return this.updateCells(newCells);
  }

  /**
   * Applies gravity to the board, shifting all tokens
   * sitting above empty cells down.
   * Then spawns new tokens from TokenFactory
   */
  applyGravity(): BoardResult {
    let updatedCells: Cell[] = [];

    for (let col = 0; col < this.cols; col++) {
      // get all tokens in column
      const column = this.getColumn(col);
      const existingTokens = column
        .filter(c => c.hasToken())
        .map(c => c.token);

      const missingCount = column.length - existingTokens.length;
      const newTokens = Array.from(
        { length: missingCount },
        () => this.tokenFactory(new Set<TokenVisual>())
      );

      const updatedColumnTokens = [...newTokens, ...existingTokens];

      column.forEach((cell, row) => {
        const oldToken = cell.token;
        const newToken = updatedColumnTokens[row];

        // Only record actual changes
        if (
          oldToken?.id !== newToken?.id ||
          (!oldToken && newToken) ||
          (oldToken && !newToken)
        ) {
          updatedCells.push(cell.withToken(newToken));
        }
      });
    }

    return this.updateCells(updatedCells);
  }


  /**
   * --- Static Factory Methods ---
   */

  /**
   * Creates a new Board from this instance with new set of cells
   */
  withCells(cells: Cell[]) {
    return new Board(this.config, cells);
  }

  /**
   */
  static createNewBoard(config: BoardConfig) {
    const cells: Cell[] = [];
    const tokenFactory = config.tokenFactory ?? (() => undefined);

    for (const pos of allPositions(config.rows, config.cols)) {
      const index = pos.row * config.cols + pos.col;
      const type = getCellType(pos, config.layout);
      let token: Token | undefined = undefined;

      // If cell can have a token
      if (isCellTypeUseable(type)) {
        token = tokenFactory(getExcludedTokens(pos, config.cols, cells));
      }

      cells.push(new Cell(pos, index, type, token));
    }

    return new Board(config, cells);
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

  return cells[index]?.tokenVisual;
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

  return excludedTokens;
}


type TokenFactory = (excludedTokens: Set<TokenVisual>) => Token | undefined;

export const EmojiTokenFactory: TokenFactory = ((excludedTokens: Set<string>) => {
  return EmojiToken.random(excludedTokens);
});
