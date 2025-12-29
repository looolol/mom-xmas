import {BoardConfig} from '../../board/models/board.model';
import {getRandomCellType} from '../../board/models/cell.model';

export interface Level {
  id: string;
  boardConfig: BoardConfig;
}

export function generateLayout(rows: number, cols: number, fillValue = 0): number[][] {
  return Array.from({ length: rows }, () =>
    Array(cols).fill(fillValue));
}

export function generateRandomLayout(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      getRandomCellType())
  );
}
