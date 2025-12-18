import {Component, Input} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {TILE_SIZE_PX} from '../../../../utils/constants';
import {clearingAnimation, dropAnimation, swapAnimation} from '../../../../animations/symbol.animations';
import {AnimationEvent} from '@angular/animations';
import {AnimationMode} from '../../../../models/animation.model';
import {AnimationService} from '../../../../services/animation.service';
import {CommonModule} from '@angular/common';
import {getDirectionDisplayOffset} from '../../../../models/direction.model';


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

  constructor(private animationService: AnimationService) { }

  onAnimationStart(event: AnimationEvent) {
    const { triggerName, fromState, toState } = event;
    console.log(`Animation started: trigger=${triggerName}, from=${fromState}, to=${toState}, symbolId=${this.symbol.id}`);
  }

  onAnimationDone(event: AnimationEvent) {
    const { triggerName, fromState, toState } = event;
    console.log(`Animation done: trigger=${triggerName}, from=${fromState}, to=${toState}, symbolId=${this.symbol.id}`);

    // Only call finishAnimation when the animation transitions TO the 'None' state,
    // which means the animation cycle is fully done.
    // if (['swap', 'clearing'].includes(fromState) && toState === AnimationMode.None) {
      console.log(`Calling finishAnimation: trigger=${triggerName}, from=${fromState}, to=${toState}, symbolId=${this.symbol.id}`);
      this.animationService.finishAnimation(this.symbol);
    // }
  }


  protected readonly TILE_SIZE_PX = TILE_SIZE_PX;
  protected readonly AnimationMode = AnimationMode;
  protected readonly getDirectionDisplayOffset = getDirectionDisplayOffset;
}
