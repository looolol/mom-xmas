import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {clearingAnimation, motionAnimation,} from '../../../../animations/symbol.animations';
import {CommonModule} from '@angular/common';
import {AnimationMode, AnimationParams, SymbolAnimation} from '../../../../models/animation.model';
import {AnimationService} from '../../../../services/animation.service';
import {Subscription} from 'rxjs';
import {EventService} from "../../../../services/event.service";
import {randomSymbol} from "../../../../utils/random-symbol";


@Component({
  selector: 'app-symbol',
  imports: [
    CommonModule,
  ],
  templateUrl: './symbol.component.html',
  styleUrl: './symbol.component.scss',
  animations: [motionAnimation, clearingAnimation],
})
export class SymbolComponent implements OnInit, OnChanges, OnDestroy {
  @Input() symbol!: SymbolModel;
  @Input() tileSizePx!: number;

  private animationSub?: Subscription;
  currentAnimation: SymbolAnimation | null = null;

  private eventSub?: Subscription;
  displayedSymbol!: string;
  hearingLoss = false;

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
      if (event.type === 'HEARING_LOSS') {
        this.hearingLoss = true;
        this.updateDisplaySymbol();
      }
      else if (event.type === 'HEARING_LOSS_CLEAR') {
        this.hearingLoss = false;
        this.updateDisplaySymbol();
      }
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
    if (this.hearingLoss) {
      this.displayedSymbol = randomSymbol();
    }
    else {
      this.displayedSymbol = this.symbol.kind;
    }
  }

  protected readonly AnimationRenderMode = AnimationMode;
  protected readonly randomSymbol = randomSymbol;
}
