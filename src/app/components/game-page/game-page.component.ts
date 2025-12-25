import {Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GameService} from '../../services/game.service';
import {BoardComponent} from '../board/board.component';
import {Cell} from '../../models/cell.model';
import {BoardState} from '../../models/board.model';
import {BoardService} from '../../services/board.service';
import {LEVEL_1} from '../../levels/level1';
import {Subject, takeUntil} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {DialogService} from '../../services/dialog.service';
import {EventService} from '../../services/event.service';
import {GameEventType} from '../../models/event.model';
import {PlayerService} from '../../services/player.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {LeaderboardComponent} from '../leaderboard/leaderboard.component';
import {SettingsComponent} from '../settings/settings.component';
import {AuthService} from '../../services/auth.service';
import {SAVE_INTERVAL_MS} from '../../utils/constants';
import {CheatSheetComponent} from '../cheat-sheet/cheat-sheet.component';

@Component({
  selector: 'app-game-page',
  imports: [
    CommonModule,
    BoardComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.scss'
})
export class GamePageComponent implements OnInit, OnDestroy {

  @ViewChild('boardArea', { static: true }) boardArea!: ElementRef<HTMLDivElement>;
  @Output() quit = new EventEmitter();

  private currentGameSessionId: string = '';
  tileSizePx: number = 32;
  private readonly GAP_PX = 4;

  board: BoardState | null = null;
  selectedCell: Cell | null = null;
  canInteract: boolean = false;
  isPaused: boolean = false;

  score: number = 0;
  private lastSaveTs = 0;

  dialogMessage: string | null = null;
  notification: string | null = null;

  isHearing = true;
  isBurning = false;
  bombActive = false;


  get isTalking() {
    return !!this.dialogMessage;
  }

  private destroy$ = new Subject<void>();


  constructor(
    private authService: AuthService,
    private playerService: PlayerService,
    protected gameService: GameService,
    private boardService: BoardService,
    private dialogService: DialogService,
    private eventService: EventService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    this.boardService.board$
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.board = board;
      });

    this.gameService.score$
      .pipe(takeUntil(this.destroy$))
      .subscribe(score => {
        this.score = score;
      });

    this.gameService.canInteract$
      .pipe(takeUntil(this.destroy$))
      .subscribe(canInteract => {
        this.canInteract = canInteract;
      });

    this.dialogService.dialogText$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dialog => {
        this.dialogMessage = dialog;
      });

    this.dialogService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.notification = notification;
      })

    this.eventService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        switch (event.type) {
          case GameEventType.BURN:
            this.isBurning = true;
            break;
          case GameEventType.BURN_CLEAR:
            this.isBurning = false;
            break;

          case GameEventType.HEARING:
            this.isHearing = false;
            break;
          case GameEventType.HEARING_CLEAR:
            this.isHearing = true;
            break;
        }
      });

    await this.authService.init();
    await this.playerService.syncLocalToGlobal();

    if (!this.playerService.getPlayerName()) {
      this.promptSettingsAndStartGame();
    } else {
      this.startGame();
    }

    window.addEventListener('beforeunload', this.saveHighScoreOnExit);
  }

  ngOnDestroy() {
    window.removeEventListener('beforeunload', this.saveHighScoreOnExit);

    this.destroy$.next();
    this.destroy$.complete();
  }

  startGame() {
    this.currentGameSessionId = Date.now().toString();
    this.gameService.startGame(LEVEL_1.board);
    this.calculateTileSize(); // init calc
  }

  promptSettingsAndStartGame() {
    this.openSettings().afterClosed().subscribe(() => {
      this.handleSettingsClosed();
    });
  }

  saveHighScoreOnExit = () => {
    if (!this.currentGameSessionId) return;
    this.playerService.addScore(this.score, this.currentGameSessionId);
    this.playerService.syncLocalToGlobal();
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateTileSize();
  }

  calculateTileSize() {
    if (!this.boardArea || !this.board) return;

    const container = this.boardArea.nativeElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const cols = this.board.cols;
    const rows = this.board.rows;

    const tileSizeWidth = (containerWidth - (cols - 1) * this.GAP_PX) / cols;
    const tileSizeHeight = (containerHeight - (rows - 1) * this.GAP_PX) / rows;

    this.tileSizePx = Math.floor(Math.min(tileSizeWidth, tileSizeHeight));
  }

  async onCellClick(cell: Cell) {
    if (!this.canInteract) return;

    // No cell selected
    if (!this.selectedCell) {
      this.selectedCell = cell;
      return;
    }

    // If same cell clicked, deselect
    if (this.selectedCell.index === cell.index) {
      this.selectedCell = null;
      return;
    }

    // Check if the two cells are adjacent (horizontal or vertical neighbors)
    if (!this.selectedCell.isAdjacent(cell)) {
      // replace with newly selected cell
      this.selectedCell = cell;
      return;
    }

    // Attempt swap
    await this.gameService.playerSwap(this.selectedCell, cell);
    this.saveScoreIfNeeded();

    // clear selection after swap attempt
    this.selectedCell = null;
  }

  async onShuffleClick() {
    if (!this.canInteract) return;
    await this.gameService.shuffleBoard();
    this.saveScoreIfNeeded();
  }

  async onBombClick() {
    if (!this.canInteract) return;

    this.bombActive = true;
    await this.gameService.useBomb();
    this.saveScoreIfNeeded();
    this.bombActive = false;
  }

  resumeGame() {
    this.isPaused = false;
    console.log('Game resumed');
  }

  openLeaderboard() {
    this.isPaused = false;

    this.playerService.addScore(this.score, this.currentGameSessionId);
    this.playerService.syncLocalToGlobal();

    this.dialog.open(LeaderboardComponent, {
      width: '90%',
      maxWidth: '600px',
      disableClose: false,
    });
  }

  cheatSheet() {
    this.isPaused = false;

    this.playerService.addScore(this.score, this.currentGameSessionId);
    this.playerService.syncLocalToGlobal();

    this.dialog.open(CheatSheetComponent, {
      width: '90%',
      maxWidth: '600px',
      disableClose: false,
    });
  }

  openSettings() {
    this.isPaused = false;

    const ref = this.dialog.open(SettingsComponent, {
      width: '90%',
      maxWidth: '400px',
      disableClose: true,
    });

    ref.afterClosed().subscribe(() => {
      this.handleSettingsClosed();
    });

    return ref;
  }

  private handleSettingsClosed() {
    if (!this.playerService.getPlayerName()) {
      // invalid name, prompt again
      this.promptSettingsAndStartGame();
      return;
    }

    this.playerService.addScore(this.score, this.currentGameSessionId);
    this.playerService.syncLocalToGlobal();

    if (!this.currentGameSessionId) {
      this.startGame();
    }
  }

  private saveScoreIfNeeded() {
    const now = Date.now();
    if (now - this.lastSaveTs < SAVE_INTERVAL_MS) return;

    this.lastSaveTs = now;
    this.playerService.addScore(this.score, this.currentGameSessionId);
    this.playerService.syncLocalToGlobal();
  }

  quitGame() {
    this.playerService.addScore(this.score, this.currentGameSessionId);
    this.playerService.syncLocalToGlobal();
    this.quit.emit();
  }
}
