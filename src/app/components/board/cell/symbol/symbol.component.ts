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
    return this.currentAnimation?.params ?? {};
  }

  protected readonly AnimationRenderMode = AnimationMode;
}
