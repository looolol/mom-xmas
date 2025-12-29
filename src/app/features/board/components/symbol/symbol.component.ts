import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {clearingAnimation, fadeAnimation, motionAnimation,} from '../../../../animations/symbol.animations';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {AnimationMode, AnimationParams, TokenAnimation} from '../../../../animations/models/animation.model';
import {AnimationService} from '../../../../animations/services/animation.service';
import {EventService} from '../../../game/services/event.service';
import {GameEventType} from '../../../game/models/event.model';
import {BURNT_TOKENS} from '../../../../core/utils/constants';
import {EmojiToken, Token} from '../../models/token';


@Component({
  selector: 'app-symbol',
  imports: [
    CommonModule,
  ],
  templateUrl: './symbol.component.html',
  styleUrl: './symbol.component.scss',
  animations: [motionAnimation, clearingAnimation, fadeAnimation],
})
export class SymbolComponent implements OnInit, OnChanges, OnDestroy {
  @Input() token!: Token;
  @Input() tileSizePx!: number;

  private animationSub?: Subscription;
  currentAnimation: TokenAnimation | null = null;

  private eventSub?: Subscription;
  displayedSymbol!: string;

  hearingLoss = false;
  burning = false;
  two_phones = false;

  constructor(
      private animationService: AnimationService,
      private eventService: EventService,
  ) { }

  ngOnInit() {
    this.animationSub = this.animationService.symbolAnimation$.subscribe(list => {
      this.currentAnimation = list.find(a => a.tokenId === this.token.id) ?? null;
    });

    // init display symbol;
    this.displayedSymbol = this.token.kind;

    this.eventSub = this.eventService.events$.subscribe(event =>{
      switch (event.type) {
        case GameEventType.HEARING:
          this.hearingLoss = true;
          break;
        case GameEventType.HEARING_CLEAR:
          this.hearingLoss = false;
          break;
        case GameEventType.BURN:
          this.burning = true;
          break;
        case GameEventType.BURN_CLEAR:
          this.burning = false;
          break;
        case GameEventType.TWO_PHONES:
          this.two_phones = true;
          break;
        case GameEventType.TWO_PHONES_CLEAR:
          this.two_phones = false;
          break;
      }

      this.updateDisplaySymbol();
    })
  }

  ngOnDestroy() {
    this.animationSub?.unsubscribe();
    this.eventSub?.unsubscribe();
  }

  ngOnChanges() {
    this.updateDisplaySymbol();
  }

  onAnimationDone(): void {
    if (!this.currentAnimation) return;
    this.animationService.notifySymbolDone(this.token.id);
  }

  get motionState() {
    if (!this.currentAnimation) return AnimationMode.None;

    if (this.currentAnimation.renderMode === AnimationMode.Move) return AnimationMode.Move;
    if (this.currentAnimation.renderMode === AnimationMode.Creating) return AnimationMode.Creating;
    if (this.currentAnimation.renderMode === AnimationMode.FadeIn) return AnimationMode.FadeIn;
    if (this.currentAnimation.renderMode === AnimationMode.FadeOut) return AnimationMode.FadeOut;

    return AnimationMode.None;
  }

  get clearingState() {
    return this.currentAnimation?.renderMode === AnimationMode.Clearing
    ? AnimationMode.Clearing
    : AnimationMode.None;
  }

  get params(): AnimationParams {
    return {
      ...this.currentAnimation?.params,
      tileSizePx: this.tileSizePx
    };
  }

  private updateDisplaySymbol() {
    if (this.burning) {
      this.displayedSymbol =
          BURNT_TOKENS[this.token.kind] ?? this.token.kind;
      return;
    }

    if (this.hearingLoss) {
      this.displayedSymbol = EmojiToken.random().emoji;
      return;
    }

    if (this.two_phones) {
      this.displayedSymbol = `${this.token.kind}${this.token.kind}`;
      return;
    }

    this.displayedSymbol = this.token.kind;
  }

  protected readonly AnimationRenderMode = AnimationMode;
  protected readonly randomSymbol = EmojiToken.random().emoji;
}
