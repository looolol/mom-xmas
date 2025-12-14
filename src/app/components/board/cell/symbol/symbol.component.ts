import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SymbolModel} from '../../../../models/symbol.model';
import {TILE_SIZE_PX} from '../../../../utils/constants';

@Component({
  selector: 'app-symbol',
  imports: [],
  templateUrl: './symbol.component.html',
  styleUrl: './symbol.component.scss'
})
export class SymbolComponent implements OnChanges {

  @Input() symbol!: SymbolModel;

  translateY = 0;

  ngOnChanges(changes: SimpleChanges) {
    if ('symbol' in changes) {
      this.updateTranslateY();
    }
  }

  private updateTranslateY() {
    if (this.symbol.fallingFrom !== undefined && this.symbol.fallingFrom >= 0) {
      const distance = this.symbol.fallingFrom + 1;
      this.translateY = distance * TILE_SIZE_PX;
    } else {
      this.translateY = 0;
    }
  }
}
