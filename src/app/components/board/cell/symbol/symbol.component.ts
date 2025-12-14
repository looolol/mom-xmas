import {Component, Input} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {TILE_SIZE_PX} from '../../../../utils/constants';
import {dropAnimation, swapAnimation} from '../../../../animations/symbol.animations';
import {AnimationEvent} from '@angular/animations';
import {directionToOffset} from '../../../../models/direction.model';
import {AnimationMode} from '../../../../models/animation.model';
import {AnimationService} from '../../../../services/animation.service';


class AnimationManager {
}

@Component({
  selector: 'app-symbol',
  imports: [],
  templateUrl: './symbol.component.html',
  styleUrl: './symbol.component.scss',
  animations: [dropAnimation, swapAnimation],
})
export class SymbolComponent {

  @Input() symbol!: SymbolModel;

  constructor(private animationService: AnimationService) { }

  onAnimationStart(event: AnimationEvent) {
    console.log('Animation started:', event.fromState, "=>", event.toState, event);
  }

  onAnimationDone(event: AnimationEvent) {
    console.log('Animation done:', event.fromState, "=>", event.toState, event);
    if (event.toState === AnimationMode.None) return;
    this.animationService.finishAnimation(this.symbol);
  }

  protected readonly TILE_SIZE_PX = TILE_SIZE_PX;
  protected readonly AnimationMode = AnimationMode;
  protected readonly directionToOffset = directionToOffset;
}
