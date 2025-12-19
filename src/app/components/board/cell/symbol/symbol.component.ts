import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {clearingAnimation, motionAnimation,} from '../../../../animations/symbol.animations';
import {CommonModule} from '@angular/common';
import {AnimationMode, AnimationParams, SymbolAnimation} from '../../../../models/animation.model';
import {AnimationService} from '../../../../services/animation.service';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-symbol',
  imports: [
    CommonModule,
  ],
  templateUrl: './symbol.component.html',
  styleUrl: './symbol.component.scss',
  animations: [motionAnimation, clearingAnimation],
})
export class SymbolComponent implements OnInit, OnDestroy {
  @Input() symbol!: SymbolModel;

  currentAnimation: SymbolAnimation | null = null;
  private subscription?: Subscription;


  constructor(private animationService: AnimationService) { }

  ngOnInit() {
    this.subscription = this.animationService.symbolAnimation$.subscribe(animations => {
      // Find animation for this symbol ID or null if none
      this.currentAnimation = animations.find(a => a.symbolId === this.symbol.id) ?? null;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }


  onAnimationDone(): void {
    if (!this.currentAnimation) return;
    if (this.clearingState) console.log("Animation done, clearing state, symbol", this.symbol.id)
    // if (!this.currentAnimation || this.currentAnimation.renderMode === AnimationMode.None) return;
    this.animationService.notifySymbolDone(this.symbol.id);
  }

  get motionState() {
    return this.currentAnimation?.renderMode === AnimationMode.Move
      ? AnimationMode.Move
      : AnimationMode.None;
  }

  get clearingState() {
    return this.currentAnimation?.renderMode === AnimationMode.Clearing
    ? AnimationMode.Clearing
    : AnimationMode.None;
  }

  get params(): AnimationParams {
    return this.currentAnimation?.params ?? {};
  }

  protected readonly AnimationRenderMode = AnimationMode;
}
