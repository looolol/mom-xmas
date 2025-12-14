import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BoardConfig, BoardState} from '../models/board.model';
import {BoardService} from './board.service';
import {Cell} from '../models/cell.model';
import {getIndex} from '../utils/board.utils';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly _score$ = new BehaviorSubject<number>(0);
  readonly score$ = this._score$.asObservable();

  private board: BoardState | null = null;

  constructor(private boardService: BoardService) {
    this.boardService.board$.subscribe(board => {
      console.log('board updated', board);
      this.board = board;
    });
  }

  async startGame(config: BoardConfig) {
    this.boardService.initBoard(config);
    this._score$.next(10);
    console.log("Game started", this._score$.value);
  }

  async playerSwap(cellA: Cell, cellB: Cell): Promise<boolean> {
    if (!this.board) return false;

    console.log("performing swap");
    // Perform swap animation
    await this.boardService.animateSwap(cellA, cellB);

    // Detect matches
    const matches = this.detectMatches();
    if (matches.length === 0) {
      // No matches: swap back
      await this.boardService.animateSwap(cellA, cellB);
      return false;
    }

    // Handle matches and subsequent refills
    await this.handleMatches(matches);
    return true;
  }

  detectMatches(): Cell[] {
    if (!this.board) return [];

    const matchedCells = new Set<Cell>();
    const { rows, cols, cells } = this.board;

    const getCell = (row: number, col: number): Cell | undefined => {
      if (row < 0 || row >= rows || col < 0 || col >= cols) return undefined;
      return cells[getIndex(row, col, cols)];
    };

    const findMatchesInDirection = (
      outerLength: number,
      innerLength: number,
      getRow: (outer: number, inner: number) => number,
      getCol: (outer: number, inner: number) => number
    ) => {
      for (let outer = 0; outer < outerLength; outer++) {
        let matchStart = 0;
        for (let inner = 1; inner <= innerLength; inner++) {
          const prevCell = getCell(getRow(outer, inner - 1), getCol(outer, inner - 1));
          const cell = getCell(getRow(outer, inner), getCol(outer, inner));

          if (
            cell && prevCell &&
            cell.symbol && prevCell.symbol &&
            cell.symbol.kind === prevCell.symbol.kind
          ) {
            continue;
          }

          const runLength = inner - matchStart;
          if (runLength >= 3) {
            for (let i = matchStart; i < inner; i++) {
              const matchedCell = getCell(getRow(outer, i), getCol(outer, i));
              if (matchedCell) matchedCells.add(matchedCell);
            }
          }
          matchStart = inner;
        }
      }
    };

    // Horizontal matches: rows = outerLength, cols = innerLength
    findMatchesInDirection(rows, cols,
      (row, col) => row,
      (row, col) => col);

    // Vertical matches: cols = outerLength, rows = innerLength
    findMatchesInDirection(cols, rows,
      (col, row) => row,
      (col, row) => col);

    return Array.from(matchedCells);
  }



  async handleMatches(matches: Cell[]) {
    if (!this.board) return;

    // Animate clearing matched cells
    await this.boardService.animateClear(matches);
    await this.boardService.dropAndFill();
    const newMatches = this.detectMatches();
    if (newMatches.length > 0) {
      await this.handleMatches(newMatches);
    }

    // Update score based on matches count (ex)
    this._score$.next(this._score$.getValue() + matches.length * 10);
  }
}
