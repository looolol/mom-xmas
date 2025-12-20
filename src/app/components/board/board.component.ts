import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {BoardState} from '../../models/board.model';
import {Cell} from '../../models/cell.model';

@Component({
  selector: 'app-board',
  imports: [
    CommonModule,
    CellComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {


  @Input() board!: BoardState | null;
  @Input() tileSizePx!: number;
  @Input() selectedCellIndex: number | null = null;

  @Output() cellClick = new EventEmitter<Cell>();


  onCellClick(cell: Cell) {
    this.cellClick.emit(cell);
  }

  isSelected(cell: Cell): boolean {
    return this.selectedCellIndex === cell.index;
  }

  trackByCell(idx: number, cell: Cell) {
    return cell.index;
  }
}
