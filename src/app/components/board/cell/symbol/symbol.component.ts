import {Component, Input} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {TILE_SIZE_PX} from '../../../../utils/constants';
import {dropAnimation} from '../../../../animations/symbol.animations';
import {AnimationEvent} from '@angular/animations';

@Component({
  selector: 'app-symbol',
  imports: [],
  templateUrl: './symbol.component.html',
  styleUrl: './symbol.component.scss',
  animations: [dropAnimation],
})
export class SymbolComponent {

  @Input() symbol!: SymbolModel;

  onAnimationStart(event: AnimationEvent) {
    console.log('Animation started:', event);
  }

  onAnimationDone(event: AnimationEvent) {
    console.log('Animation done:', event);
  }

  protected readonly TILE_SIZE_PX = TILE_SIZE_PX;
}
