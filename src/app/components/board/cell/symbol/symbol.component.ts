import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {clearingAnimation, motionAnimation,} from '../../../../animations/symbol.animations';
import {CommonModule} from '@angular/common';
import {AnimationMode, AnimationParams, SymbolAnimation} from '../../../../models/animation.model';
import {AnimationService} from '../../../../services/animation.service';
import {Subscription} from 'rxjs';
import {TILE_SIZE_PX} from "../../../../utils/constants";
import {BoardStyle} from "../../../../models/board.model";


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
  @Input() cellIndex!: number;
  @Input() boardStyle!: BoardStyle;

  private sub?: Subscription;
  currentAnimation: SymbolAnimation | null = null;


  constructor(private animationService: AnimationService) { }

  ngOnInit() {
    this.sub = this.animationService.symbolAnimation$.subscribe(list => {
      this.currentAnimation = list.find(a => a.symbolId === this.symbol.id) ?? null;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }


  get x(): number {
    return this.boardStyle.getCellPosition(this.cellIndex).x;
  }

  get y(): number {
    return this.boardStyle.getCellPosition(this.cellIndex).y;
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
