import {BoardConfig} from '../../board/models/board.model';

export interface Level {
  id: string;
  board: BoardConfig;
}

function generateLayout(rows: number, cols: number, fillValue = 0): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}
