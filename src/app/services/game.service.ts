import {Injectable} from '@angular/core';
import {BehaviorSubject, map} from 'rxjs';
import {BoardConfig} from '../models/board.model';
import {BoardService} from './board.service';
import {Cell} from '../models/cell.model';
import {POINTS_PER_CELL} from '../utils/constants';
import {GamePhase, gameModel} from '../models/game.model';

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
    console.log('Initialized board...');
    this.boardService.initBoard(config);
    this._score$.next(0);
    this.setPhase(GamePhase.Idle);
    console.log('Resolving initial board...');
    await this.resolveMatches();
  }

  async playerSwap(a: Cell, b: Cell): Promise<boolean> {
    if (this._phase$.getValue() !== GamePhase.Idle){
      console.warn("Can't swap, phase is " + this._phase$.getValue());
      return false;
    }

    const board = this.boardService.board;
    if (!board) return false;

    this.setPhase(GamePhase.Swapping);
    try {
      await this.boardService.animateSwap(a, b);
    } catch (error) {
      console.error('Swap animation failed:', error);
      this.boardService.updateBoard(board);
      this.setPhase(GamePhase.Idle);
      return false;
    }

    console.log('Swap animation complete:', board);
    const swappedBoard = this.boardService.board;
    if (!swappedBoard) {
      console.error('Board state missing after swap animation');
      this.setPhase(GamePhase.Idle);
      return false;
    }

    const matches = this.boardService.detectMatches(swappedBoard);
    if (matches.length === 0) {
      console.log('Swap did not match!');
      const swappedA = swappedBoard.getCell(a.pos);
      const swappedB = swappedBoard.getCell(b.pos);

      if (!swappedA || !swappedB) {
        console.error('Could not find swapped cells to revert swap');
        this.setPhase(GamePhase.Idle);
        return false;
      }
      console.log('Swapped cells', swappedA, swappedB);

      // swap back
      try {
        await this.boardService.animateSwap(swappedA, swappedB);
      } catch (error) {
        console.error('Swap back animation failed:', error);
      }
      console.log('Animation done, updating board');
      this.boardService.updateBoard(board);
      console.log('Setting phase back to idle');
      this.setPhase(GamePhase.Idle);
      return false;
    }

    this.setPhase(GamePhase.Idle);
    await this.resolveMatches(matches);
    return true;
  }

  private async resolveMatches(startingMatches?: Cell[]): Promise<void> {
    let matches = startingMatches ?? this.boardService.detectMatches();

    while (matches.length > 0) {
      this.setPhase(GamePhase.ResolvingMatches);
      try {
        await this.boardService.animateClear(matches);
      } catch (error) {
        console.error('Clear animation failed:', error);
      }
      this.boardService.updateBoard(this.boardService.clearCells(this.boardService.board!, matches));

      this.addScore(matches);

      this.setPhase(GamePhase.ResolvingDrop);
      this.boardService.updateBoard(this.boardService.dropAndFillColumns(this.boardService.board!));

      this.setPhase(GamePhase.Filling);
      // await optional drops/fills

      matches = this.boardService.detectMatches(this.boardService.board);
      console.log('Matches found:', matches.length);
    }

    this.setPhase(GamePhase.Idle);
  }
}
