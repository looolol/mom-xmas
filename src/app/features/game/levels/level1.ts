import {generateLayout, Level} from '../models/level.model';
import {EmojiTokenFactory} from '../../board/models/board.model';

const rows = 10;
const cols = 8;

export const LEVEL_1: Level = {
  id: 'level1',
  boardConfig: {
    rows: rows,
    cols: cols,
    layout: generateLayout(rows, cols),
    tokenFactory: EmojiTokenFactory,
  }
}
