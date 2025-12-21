import {Injectable} from '@angular/core';
import {BehaviorSubject, map} from 'rxjs';
import {BoardConfig} from '../models/board.model';
import {BoardService} from './board.service';
import {Cell} from '../models/cell.model';
import {POINTS_PER_CELL} from '../utils/constants';
import {gameModel, GamePhase} from '../models/game.model';
import {DialogService} from './dialog.service';
import {dialogLinesBySymbol} from "../models/dialog.model";
import {EventService} from "./event.service";
import {GameEventType} from "../models/event.model";

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
    let comboCount = 0;

    while (matches.length > 0) {
      comboCount += 1;
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

      if (this.containsSymbol(matches, '🍪')) {
        if (this.eventService.emit({ type: GameEventType.BURN, durationMs: 10000})) {
          this.dialogService.showNotifications('MOM THE COOKIES!!!', 5000);
        }
      }

      this.triggerDialogForMatches(matches);
      this.checkComboEvents(comboCount, matches);

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

  private checkComboEvents(comboCount: number, matches: Cell[]) {
    // Bad Combo
    if (comboCount === 1) {
      const eventChance = Math.random();
      if (eventChance < 0.10) {

        // Hearing event
        if (eventChance < 0.10) {
          if (this.eventService.emit({ type: GameEventType.HEARING, durationMs: 10000})) {
            this.dialogService.showNotifications('What??? Symbols are misheard for a while...', 5000);
            return; // Priority
          }
        }
      }
    }

    // Combo dialog every 3 combos
    if (comboCount === 3) {
      this.dialogService.showNotifications("Combo x3! Nice streak!", 3000);
    } else if (comboCount === 4) {
      this.dialogService.showNotifications("Combo x4! Crushing it!", 3000);
    } else if (comboCount >= 5) {
      this.dialogService.showNotifications("Combo x5! Legendary!", 3000);
      return; // Priority
    }

    // Check for big matches (length >= 5)
    const clusters = this.groupMatchesByClusters(matches);
    const bigMatches = clusters.filter(cluster => cluster.length >= 5);

    if (bigMatches.length > 0) {
      this.dialogService.showNotifications("Big Match! Wow!", 3000);
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

  private containsSymbol(matches: Cell[], kind: string): boolean {
    return matches.some(cell => cell.getSymbolKind() === kind);
  }

}
