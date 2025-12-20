import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { BoardConfig } from '../models/board.model';
import { BoardService } from './board.service';
import { Cell } from '../models/cell.model';
import { POINTS_PER_CELL } from '../utils/constants';
import { GamePhase, gameModel } from '../models/game.model';
import { DialogService } from './dialog.service';
import {dialogLinesBySymbol} from "../models/dialog.model";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly _phase$ = new BehaviorSubject<GamePhase>(GamePhase.Uninitialized);
  readonly phase$ = this._phase$.asObservable();

  private readonly _score$ = new BehaviorSubject<number>(0);
  readonly score$ = this._score$.asObservable();

  readonly canInteract$ = this.phase$.pipe(
    map(phase => phase === GamePhase.Idle)
  );


  constructor(
      private boardService: BoardService,
      private dialogService: DialogService,
  ) { }


  private setPhase(next: GamePhase) {
    const phase = this._phase$.getValue();
    if (!gameModel(phase, next)) {
      throw new Error(`Invalid phase transition: ${phase} → ${next}`);
    }
    console.log('Changing phase', next);
    this._phase$.next(next);
  }

  get score(): number {
    return this._score$.getValue();
  }

  set score(value: number) {
    this._score$.next(value);
  }

  addScore(matches: Cell[]) {
    this.score = this.score + matches.length * POINTS_PER_CELL;
  }

  async startGame(config: BoardConfig) {
    this.setPhase(GamePhase.Uninitialized);

    this.boardService.initBoard(config);
    this.score = 0;

    this.setPhase(GamePhase.Idle);
    await this.resolveMatches();
    this.setPhase(GamePhase.Idle);
  }

  /**
   * Handles a player swap attempt.
   * Returns true if the swap results in matches and is accepted.
   * Returns false if no match or invalid phase.
   */
  async playerSwap(a: Cell, b: Cell): Promise<boolean> {
    if (this._phase$.getValue() !== GamePhase.Idle) return false;

    const board = this.boardService.board;
    if (!board) return false;

    this.setPhase(GamePhase.Swapping);

    // Animate the swap
    const animated = await this.boardService.animateSwap(a, b);
    if (!animated) {
      // Revert board back if animation failed or skipped
      this.boardService.updateBoard(board);
      this.setPhase(GamePhase.Idle);
      return false;
    }

    // Update board state by swapping cells
    const swappedBoard = this.boardService.swapCells(board, a, b);
    this.boardService.updateBoard(swappedBoard);


    // Check for matches on the swapped board
    const matches = this.boardService.detectMatches(swappedBoard);
    if (matches.length === 0) {
      // No matches: revert swap back visually and logically
      await this.boardService.animateSwap(
        swappedBoard.getCell(a.pos)!,
        swappedBoard.getCell(b.pos)!,
      );

      this.boardService.updateBoard(board);
      this.setPhase(GamePhase.Idle);
      return false;
    }

    // Matches detected: resolve them
    await this.resolveMatches();
    this.setPhase(GamePhase.Idle);
    return true;
  }


  /**
   * Resolves matches on the board: clears matches, drops symbols, fills empty cells, and repeats if new matches appear.
   */
  private async resolveMatches(startingMatches?: Cell[]): Promise<void> {
    let matches = startingMatches ?? this.boardService.detectMatches();

    while (matches.length > 0) {
      this.setPhase(GamePhase.ResolvingMatches);
      await this.boardService.animateClear(matches);

      const clearedBoard = this.boardService.clearCells(this.boardService.board!, matches);
      this.boardService.updateBoard(clearedBoard);
      this.addScore(matches);

      this.setPhase(GamePhase.ResolvingDrop);
      const droppedBoard = this.boardService.applyGravity(clearedBoard!);
      await this.boardService.animateDrop(clearedBoard, droppedBoard);
      this.boardService.updateBoard(droppedBoard);

      this.setPhase(GamePhase.Filling);
      const newSymbols = this.boardService.detectNewSymbols(clearedBoard, droppedBoard);
      await this.boardService.animateCreate(newSymbols);

      this.triggerDialogForMatches(matches);

      matches = this.boardService.detectMatches(this.boardService.board);
    }
  }

  private triggerDialogForMatches(matches: Cell[]) {
    if (matches.length === 0) return;

    const countBySymbol = matches.reduce<Record<string, number>>((acc, cell) => {
      const symbolKind = cell.getSymbolKind();
      if (!symbolKind) return acc;
      acc[symbolKind] = (acc[symbolKind] || 0) + 1;
      return acc;
    }, {});

    const [topSymbol] = Object.entries(countBySymbol).sort((a, b) => b[1] - a[1])[0] ?? [];
    if (!topSymbol) return;

    const lines = dialogLinesBySymbol[topSymbol];
    if (!lines || lines.length === 0) return;

    const validLines = lines.filter(line => Math.random() < line.chance);
    if (validLines.length === 0) return;

    const chosenLine = validLines[Math.floor(Math.random() * validLines.length)];

    this.dialogService.showDialog(chosenLine.text, 4000);
  }
}
