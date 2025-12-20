import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  Output,
  ViewChild
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
export class BoardComponent implements AfterViewInit {

  @ViewChild('boardWrapper', { static: true }) boardWrapper!: ElementRef<HTMLDivElement>;

  @Input()board!: BoardState | null;
  @Input() selectedCellIndex: number | null = null;

  tileSizePx: number = 64;
  private readonly GAP_PX = 4;

  @Output() cellClick = new EventEmitter<Cell>();


  ngAfterViewInit() {
    this.calculateTileSize(); // init calc
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateTileSize();
  }


  calculateTileSize() {
    if (!this.boardWrapper || !this.board) return;

    const container = this.boardWrapper.nativeElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    console.log('containerWidth', containerWidth);
    console.log('containerHeight', containerHeight);

    const cols = this.board.cols;
    const rows = this.board.rows;

    console.log('cols', cols);
    console.log('rows', rows);

    console.log('gap_px', this.GAP_PX);

    const tileSizeWidth = (containerWidth - (cols - 1) * this.GAP_PX) / cols;
    const tileSizeHeight = (containerHeight - (rows - 1) * this.GAP_PX) / rows;

    console.log('tileSizeWidth', tileSizeWidth);
    console.log('tileSizeHeight', tileSizeHeight);

    this.tileSizePx = Math.floor(Math.min(tileSizeWidth, tileSizeHeight));
    console.log('TileSizePx', this.tileSizePx);
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
