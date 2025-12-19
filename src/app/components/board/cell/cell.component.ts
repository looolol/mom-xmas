import {Component, HostBinding, Input} from '@angular/core';
import {Cell, CellType} from '../../../models/cell.model';
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

  private _selected = false;

  @HostBinding('class.selected') get selectedClass() {
    return this._selected;
  }

  @Input()
  set isSelected(value: boolean) {
    this._selected = value;
  }

  protected readonly CellTypeEnum = CellType;
  protected readonly selected = this._selected;
}
