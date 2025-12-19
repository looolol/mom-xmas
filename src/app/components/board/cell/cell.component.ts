import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Cell, CellType} from '../../../models/cell.model';
import {CommonModule} from '@angular/common';
import {SymbolComponent} from './symbol/symbol.component';
import {AnimationMode, SymbolAnimation} from '../../../models/animation.model';


@Component({
  selector: 'app-cell',
  imports: [
    CommonModule,
    SymbolComponent,
  ],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss'
})
export class CellComponent {

  @Input() cell!: Cell;
  @Input() animation: SymbolAnimation | null = null;

  protected readonly CellTypeEnum = CellType;
}
