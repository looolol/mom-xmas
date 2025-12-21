import {Injectable} from '@angular/core';
import {BehaviorSubject, map} from 'rxjs';
import {BoardConfig} from '../models/board.model';
import {BoardService} from './board.service';
import {Cell} from '../models/cell.model';
import {
  DIALOG_CHANCE,
  POINTS_PER_CELL,
  SPECIAL_EVENT_CHANCE
} from '../utils/constants';
import {gameModel, GamePhase} from '../models/game.model';
import {DialogService} from './dialog.service';
import {dialogLinesBySymbol} from "../models/dialog.model";
import {EventService} from "./event.service";
import {GAME_EVENTS, GameEventType} from "../models/event.model";
import {Dir} from "../models/direction.model";
import {UI_STRINGS, UI_DISPLAY_DURATIONS} from '../models/ui-messages.model';
import {PlayerService} from './player.service';

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

  private readonly _shuffleCount$ = new BehaviorSubject<number>(1);
  readonly shuffleCount$ = this._shuffleCount$.asObservable();

  private readonly _bombCount$ = new BehaviorSubject<number>(1);
  readonly bombCount$ = this._bombCount$.asObservable();

  private setShuffleCount(value: number) {
    this._shuffleCount$.next(value);
  }
  private setBombCount(value: number) {
    this._bombCount$.next(value);
  }


  constructor(
    private playerService: PlayerService,
    private boardService: BoardService,
    private eventService: EventService,
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

  addScore(matches: Cell[], combo: number) {
    this.score = this.score + matches.length * POINTS_PER_CELL * combo;
  }

  async startGame(config: BoardConfig) {
    this.setPhase(GamePhase.Uninitialized);

    this.boardService.initBoard(config);
    this.score = 0;

    this.setPhase(GamePhase.Idle);
    await this.resolveMatches();
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
      this.dialogService.showDialog(UI_STRINGS.no_matches_dialog, UI_DISPLAY_DURATIONS.medium)
      this.dialogService.showNotifications(UI_STRINGS.no_matches_notification, UI_DISPLAY_DURATIONS.long);

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
    return true;
  }


  /**
   * Resolves matches on the board: clears matches, drops symbols, fills empty cells, and repeats if new matches appear.
   */
  private async resolveMatches(startingMatches?: Cell[]): Promise<void> {
    let matches = startingMatches ?? this.boardService.detectMatches();
    let comboCount = 0;

    while (matches.length > 0) {
      comboCount += 1;
      this.setPhase(GamePhase.ResolvingMatches);
      await this.boardService.animateClear(matches);

      const clearedBoard = this.boardService.clearCells(this.boardService.board!, matches);
      this.boardService.updateBoard(clearedBoard);
      this.addScore(matches, comboCount);

      this.setPhase(GamePhase.ResolvingDrop);
      const droppedBoard = this.boardService.applyGravity(clearedBoard!);
      await this.boardService.animateDrop(clearedBoard, droppedBoard);
      this.boardService.updateBoard(droppedBoard);

      this.setPhase(GamePhase.Filling);
      const newSymbols = this.boardService.detectNewSymbols(clearedBoard, droppedBoard);
      await this.boardService.animateCreate(newSymbols);

      const dialogChance = Math.random();
      if (dialogChance < DIALOG_CHANCE) {
        this.triggerDialogForMatches(matches);
      }

      const eventChance = Math.random();
      if (eventChance < SPECIAL_EVENT_CHANCE) {
        if (this.containsSymbol(matches, '🍪')) {
          this.tryTriggerEvent(GameEventType.BURN);
        }
        if (this.containsSymbol(matches, '🎠')) {
          if (this.tryTriggerEvent(GameEventType.CAROUSEL)) {
            await this.triggerCarousel();
          }
        }
        if (this.containsSymbol(matches, '⭐')) {
          this.dialogService.showNotifications(UI_STRINGS.add_bomb, UI_DISPLAY_DURATIONS.long);
          this.setBombCount(this._bombCount$.getValue() + 1);
        }
      }
      this.checkComboEvents(comboCount, matches);

      matches = this.boardService.detectMatches(this.boardService.board);
    }

    this.setPhase(GamePhase.Idle);
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
    if (!lines?.length) return;

    const chosenLine = lines[Math.floor(Math.random() * lines.length)];

    this.dialogService.showDialog(chosenLine, UI_DISPLAY_DURATIONS.medium);
  }

  private checkComboEvents(comboCount: number, matches: Cell[]) {
    // Bad Combo
    if (comboCount === 1) {
      if (this.tryTriggerEvent(GameEventType.HEARING)) {
        return;
      }
    }

    // Combo dialog every 3 combos
    if (comboCount === 3) {
      this.dialogService.showNotifications(UI_STRINGS.combo_3x, UI_DISPLAY_DURATIONS.medium);
    } else if (comboCount === 4) {
      this.dialogService.showNotifications(UI_STRINGS.combo_4x, UI_DISPLAY_DURATIONS.medium);
    } else if (comboCount >= 5) {
      this.dialogService.showNotifications(UI_STRINGS.combo_5x, UI_DISPLAY_DURATIONS.medium);
      // 5x adds a shuffle
      this.setShuffleCount(this._shuffleCount$.getValue() + 1);
      return;
    }

    // Check for big matches (length >= 5)
    const clusters = this.groupMatchesByClusters(matches);
    const bigMatches = clusters.filter(cluster => cluster.length >= 5);

    if (bigMatches.length > 0) {
      this.dialogService.showNotifications(UI_STRINGS.big_match, UI_DISPLAY_DURATIONS.medium);
    }
  }

  private groupMatchesByClusters(matches: Cell[]): Cell[][] {
    const clusters: Cell[][] = [];
    const visited = new Set<string>();

    // Helper: stringify position for set
    const posKey = (cell: Cell) => `${cell.pos.row},${cell.pos.col}`;

    // Check adjacency for same symbol kind
    const areAdjacent = (a: Cell, b: Cell) => a.isAdjacent(b) && a.getSymbolKind() === b.getSymbolKind();

    for (const cell of matches) {
      if (visited.has(posKey(cell))) continue;

      const cluster: Cell[] = [];
      const stack = [cell];
      visited.add(posKey(cell));

      while (stack.length > 0) {
        const current = stack.pop()!;
        cluster.push(current);

        // Find neighbors in matches not visited yet
        for (const neighbor of matches) {
          if (!visited.has(posKey(neighbor)) && areAdjacent(current, neighbor)) {
            visited.add(posKey(neighbor));
            stack.push(neighbor);
          }
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  private async triggerCarousel(): Promise<void> {
    while (this.eventService.currentEvent === GameEventType.CAROUSEL) {
      const board = this.boardService.board;
      if (!board) return;

      await this.boardService.animateCarousel(board);

      let newBoard = board;
      for (let row = 0; row < board.rows; row++) {
        const dir = row % 2 === 0 ? Dir.RIGHT : Dir.LEFT;
        newBoard = this.boardService.rotateRow(newBoard, row, dir);
      }
      this.boardService.updateBoard(newBoard);

      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  private containsSymbol(matches: Cell[], kind: string): boolean {
    return matches.some(cell => cell.getSymbolKind() === kind);
  }


  async shuffleBoard(): Promise<void> {
    const board = this.boardService.board;
    if (!board) return;

    if (this._shuffleCount$.getValue() <= 0) {
      this.dialogService.showDialog(UI_STRINGS.no_powerups, UI_DISPLAY_DURATIONS.medium);
      this.dialogService.showNotifications(UI_STRINGS.no_shuffles, UI_DISPLAY_DURATIONS.long);
      this.setPhase(GamePhase.Idle);
      return;
    }

    if (!this.eventService.emit(GAME_EVENTS[GameEventType.SHUFFLE])) {
      this.dialogService.showNotifications(UI_STRINGS.not_now, UI_DISPLAY_DURATIONS.long);
      return;
    }

    this.setPhase(GamePhase.Shuffling);
    this.dialogService.showDialog(UI_STRINGS.shuffle_dialog, UI_DISPLAY_DURATIONS.medium);
    this.setShuffleCount(this._shuffleCount$.getValue() - 1);

    await this.boardService.animateFadeOut(board);

    const shuffledBoard = this.boardService.shuffleBoard(board);
    this.boardService.updateBoard(shuffledBoard);

    await this.boardService.animateFadeIn(shuffledBoard);

    await this.resolveMatches();
  }

  async useBomb(): Promise<boolean> {
    const board = this.boardService.board;
    if (!board) return false;

    if (this._bombCount$.getValue() <= 0) {
      this.dialogService.showDialog(UI_STRINGS.no_powerups, UI_DISPLAY_DURATIONS.medium);
      this.dialogService.showNotifications(UI_STRINGS.no_bombs, UI_DISPLAY_DURATIONS.long);
      return false;
    }

    if (!this.eventService.emit(GAME_EVENTS[GameEventType.BOMB])) {
      this.dialogService.showNotifications(UI_STRINGS.not_now, UI_DISPLAY_DURATIONS.long);
      return false;
    }

    this.setPhase(GamePhase.Bomb);
    this.dialogService.showDialog(UI_STRINGS.bomb_dialog, UI_DISPLAY_DURATIONS.medium);
    this.setBombCount(this._bombCount$.getValue() - 1);

    const bomb: Cell[] = this.boardService.getBomb(board);

    await this.resolveMatches(bomb);
    return true;
  }

  private tryTriggerEvent(type: GameEventType): boolean {
    const gameEvent = GAME_EVENTS[type];
    if (!gameEvent) return false;

    if (Math.random() > gameEvent.chance) return false;

    return this.eventService.emit(gameEvent);
  }
}
