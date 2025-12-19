import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { BoardConfig } from '../models/board.model';
import { BoardService } from './board.service';
import { Cell } from '../models/cell.model';
import { POINTS_PER_CELL } from '../utils/constants';
import { GamePhase, gameModel } from '../models/game.model';

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

  constructor(private boardService: BoardService) { }

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
    console.log('Starting game...');
    this.setPhase(GamePhase.Uninitialized);

    this.boardService.initBoard(config);
    this.score = 0;

    this.setPhase(GamePhase.Idle);
    console.log('Resolving initial matches on board...');
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
    console.log('Resolving matches...');
    let matches = startingMatches ?? this.boardService.detectMatches();

    while (matches.length > 0) {
      this.setPhase(GamePhase.ResolvingMatches);
      console.log('Animating clear...');
      await this.boardService.animateClear(matches);

      console.log('Updating Board...');
      const clearedBoard = this.boardService.clearCells(this.boardService.board!, matches);
      this.boardService.updateBoard(clearedBoard);
      this.addScore(matches);

      this.setPhase(GamePhase.ResolvingDrop);
      const droppedBoard = this.boardService.applyGravity(clearedBoard!);

      this.setPhase(GamePhase.Filling);
      await this.boardService.animateDrop(clearedBoard, droppedBoard);
      this.boardService.updateBoard(droppedBoard);

      matches = this.boardService.detectMatches(this.boardService.board);
      console.log(`Matches found after fill: ${matches.length}`)
    }
  }
}
