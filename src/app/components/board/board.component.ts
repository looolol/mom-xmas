import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {BoardState, BoardStyle} from '../../models/board.model';
import {Cell} from '../../models/cell.model';
import {SymbolComponent} from './cell/symbol/symbol.component';
import {TILE_SIZE_PX} from '../../utils/constants';

@Component({
  selector: 'app-board',
  imports: [
    CommonModule,
    CellComponent,
    SymbolComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnChanges{

  @Input() board!: BoardState | null;
  @Input() selectedCellIndex: number | null = null;

  @Output() cellClick = new EventEmitter<Cell>();

  readonly cellSizePx = TILE_SIZE_PX;
  readonly cellGapPx = 4;
  readonly boardPaddingPx = 8;

  boardStyle!: BoardStyle;


  ngOnChanges(changes: SimpleChanges) {
    if (this.board) {
      this.boardStyle = new BoardStyle(
        this.cellSizePx,
        this.cellGapPx,
        this.boardPaddingPx,
        this.board.rows,
        this.board.cols
      );
    }
  }


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
