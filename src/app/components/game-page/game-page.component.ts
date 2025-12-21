import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-game-page',
  imports: [
    CommonModule,
    BoardComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.scss'
})
export class GamePageComponent implements OnInit, OnDestroy {

  @ViewChild('boardArea', { static: true }) boardArea!: ElementRef<HTMLDivElement>;

  board: BoardState | null = null;
  selectedCell: Cell | null = null;
  canInteract: boolean = false;
  isPaused: boolean = false;
  score: number = 0;


  tileSizePx: number = 32;
  private readonly GAP_PX = 4;

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
    protected gameService: GameService,
    private boardService: BoardService,
    private dialogService: DialogService,
    private eventService: EventService,
  ) { }

  ngOnInit() {
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

    this.gameService.startGame(LEVEL_1.board);
    this.calculateTileSize(); // init calc
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    const adj = this.selectedCell.isAdjacent(cell);
    if (!this.selectedCell.isAdjacent(cell)) {
      // replace with newly selected cell
      this.selectedCell = cell;
      return;
    }

    // Attempt swap
    await this.gameService.playerSwap(this.selectedCell, cell);

    // clear selection after swap attempt
    this.selectedCell = null;
  }

  async onShuffleClick() {
    if (!this.canInteract) return;
    await this.gameService.shuffleBoard();
  }

  async onBombClick() {
    if (!this.canInteract) return;

    this.bombActive = true;
    await this.gameService.useBomb();
    this.bombActive = false;
  }

  resumeGame() {
    this.isPaused = false;
    console.log('Game resumed');
  }

  restartLevel() {
    this.isPaused = false;
    //this.gameService.startGame(LEVEL_1.board);
    console.log('Level restarted');
  }

  openSettings() {
    console.log('Settings opened (stub)');
    // Add settings UI logic here
  }
}
