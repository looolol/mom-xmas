import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {clearingAnimation, fadeAnimation, motionAnimation,} from '../../../../animations/symbol.animations';
import {CommonModule} from '@angular/common';
import {AnimationMode, AnimationParams, SymbolAnimation} from '../../../../models/animation.model';
import {AnimationService} from '../../../../services/animation.service';
import {Subscription} from 'rxjs';
import {EventService} from "../../../../services/event.service";
import {randomSymbol} from "../../../../utils/random-symbol";
import {GameEventType} from "../../../../models/event.model";
import {BURNT_SYMBOLS} from "../../../../utils/constants";


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
  @Input() symbol!: SymbolModel;
  @Input() tileSizePx!: number;

  private animationSub?: Subscription;
  currentAnimation: SymbolAnimation | null = null;

  private eventSub?: Subscription;
  displayedSymbol!: string;

  hearingLoss = false;
  burning = false;

  constructor(
      private animationService: AnimationService,
      private eventService: EventService,
  ) { }

  ngOnInit() {
    this.animationSub = this.animationService.symbolAnimation$.subscribe(list => {
      this.currentAnimation = list.find(a => a.symbolId === this.symbol.id) ?? null;
    });

    // init display symbol;
    this.displayedSymbol = this.symbol.kind;

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
    this.animationService.notifySymbolDone(this.symbol.id);
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
          BURNT_SYMBOLS[this.symbol.kind] ?? this.symbol.kind;
      return;
    }

    if (this.hearingLoss) {
      this.displayedSymbol = randomSymbol();
      return;
    }

    this.displayedSymbol = this.symbol.kind;
  }

  protected readonly AnimationRenderMode = AnimationMode;
  protected readonly randomSymbol = randomSymbol;
}
