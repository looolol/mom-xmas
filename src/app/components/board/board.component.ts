import {Component, OnInit} from '@angular/core';
import {BoardService} from '../../services/board.service';
import {LEVEL_1} from '../../levels/level1';
import {CommonModule} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {Cell} from '../../models/cell.model';
import {TILE_SIZE_PX} from '../../utils/constants';

@Component({
  selector: 'app-board',
  imports: [
    CommonModule,
    CellComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {

  constructor(private boardService: BoardService) { }

  ngOnInit() {
    this.boardService.initBoard(LEVEL_1.board);
  }

  get board$() {
    return this.boardService.board$;
  }

  trackByCell(idx: number, cell: Cell) {
    return cell.index;
  }

  protected readonly TILE_SIZE_PX = TILE_SIZE_PX;
}
