import {Component, Input} from '@angular/core';
import {Cell, CellType} from '../../../models/cell.model';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-cell',
  imports: [
    CommonModule,
  ],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss'
})
export class CellComponent {
  @Input() cell!: Cell;
  @Input() isSelected = false;

  protected readonly CellType = CellType;
}
