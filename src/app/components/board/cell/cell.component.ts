import {Component, Input} from '@angular/core';
import {Cell, CellTypeEnum} from '../../../models/cell.model';
import {CommonModule} from '@angular/common';
import {SymbolComponent} from './symbol/symbol.component';

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

  protected readonly CellTypeEnum = CellTypeEnum;
}
