import {Injectable, Signal, signal} from '@angular/core';
import {BoardService} from '../../board/services/board.service';
import {Cell} from '../../board/models/cell.model';
import {BoardChange} from '../../board/models/board.result.model';
import {POINTS_PER_CELL} from '../../../core/utils/constants';
import {TurnContext, TurnResult} from '../models/turn.model';
import {GamePhase, validGamePhaseTransitions} from '../models/game.model';
import {GameEventType} from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _phase = signal<GamePhase>(GamePhase.Uninitialized);
  readonly phase: Signal<GamePhase> = this._phase.asReadonly();

  private _score =  signal<number>(0);
  readonly score: Signal<number> = this._score.asReadonly();

  private _events = signal<GameEventType[]>([]);
  private events: Signal<GameEventType[]> = this._events.asReadonly();

  private _dialogs = signal<string[]>([]);
  readonly dialogs: Signal<string[]> = this._dialogs.asReadonly();

  private setPhase(next: GamePhase): void {
    if (!validGamePhaseTransitions[this.phase()].includes(next)) {
      throw new Error(`Invalid phase transition from ${GamePhase[this.phase()]} to ${GamePhase[next]}`);
    }

    this._phase.set(next);
    console.log(`Game phase changed to: ${GamePhase[this.phase()]}`);
  }


  constructor(
    private boardService: BoardService,
  ) {}


  playerSwap(a: Cell, b: Cell): TurnResult {
    if (this.phase() !== GamePhase.Idle) {
      throw new Error(`Invalid swap during phase: ${GamePhase[this.phase()]}`);
    }
    this.setPhase(GamePhase.Swapping);

    const ctx: TurnContext = {
      combo: 0,
      twoPhonesActive: false,
    };

    this._events.set([]);
    this._dialogs.set([]);

    const changes: BoardChange[] = [];

    changes.push(...this.boardService.swap(a, b));

    this.setPhase(GamePhase.Resolving);
    const scoreDelta = this.resolveUntilStable(changes, ctx);
    this._score.update(current => current + scoreDelta);

    this.setPhase(GamePhase.Idle);

    this._events.set([]);
    this._dialogs.set([]);

    return {
      changes,
      scoreDelta: scoreDelta,
      events: [],
      dialogs: [],
    };
  }

  private resolveUntilStable(changes: BoardChange[], ctx: TurnContext): number {
    let scoreDelta = 0;

    while(!this.boardService.isStable()) {
      ctx.combo++;

      const matches = [...this.boardService.matches()];
      changes.push(...this.boardService.clearMatches());

      scoreDelta += this.scoreMatches(matches, ctx);

      changes.push(...this.boardService.applyGravity());
    }

    return scoreDelta;
  }

  // useBomb(): TurnResult {
  //
  // }
  //
  // shuffle(): TurnResult {
  //
  // }


  private scoreMatches(matches: Cell[], ctx: TurnContext): number {
    const base = matches.length * POINTS_PER_CELL;
    const comboMult = ctx.combo;
    const eventMult = ctx.twoPhonesActive ? 2 : 1;

    return base * comboMult * eventMult;

  }
}
