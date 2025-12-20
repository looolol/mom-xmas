import {Level} from '../models/level.model';
import {getRandomCellType} from '../models/cell.model';

const rows = 16;
const cols = 16;

export const LEVEL_2: Level = {
  id: 'level2',
  board: {
    rows: rows,
    cols: cols,
    layout: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => getRandomCellType())
    ),
  }
}
