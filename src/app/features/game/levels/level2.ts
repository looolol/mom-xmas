import {generateRandomLayout, Level} from '../models/level.model';

const rows = 16;
const cols = 16;

export const LEVEL_2: Level = {
  id: 'level2',
  boardConfig: {
    rows: rows,
    cols: cols,
    layout: generateRandomLayout(rows, cols),
  }
}
