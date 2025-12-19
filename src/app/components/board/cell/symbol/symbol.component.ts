import {Component, Input} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {clearingAnimation, dropAnimation, swapAnimation} from '../../../../animations/symbol.animations';
import {CommonModule} from '@angular/common';
import {AnimationParams, AnimationRenderMode, SymbolAnimation} from '../../../../models/animation.model';
import {AnimationService} from '../../../../services/animation.service';


@Component({
  selector: 'app-symbol',
  imports: [
    CommonModule,
  ],
  templateUrl: './symbol.component.html',
  styleUrl: './symbol.component.scss',
  animations: [dropAnimation, swapAnimation, clearingAnimation],
})
export class SymbolComponent {
  @Input() symbol!: SymbolModel;
  @Input() animation: SymbolAnimation | null = null;

  constructor(private animationService: AnimationService) { }

  onAnimationDone(): void {
    if (!this.animation) return;
    console.log('Animation done for symbol:', this.symbol.id, 'mode:', this.renderMode);
    this.animationService.notifySymbolDone(this.symbol.id);
  }

  get renderMode(): AnimationRenderMode {
    return this.animation?.renderMode ?? AnimationRenderMode.None;
  }

  get params(): AnimationParams {
    return this.animation?.params ?? {};
  }

  protected readonly AnimationRenderMode = AnimationRenderMode;
}
