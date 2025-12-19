import {Level} from '../models/level.model';

function generateLayout(number: number, number2: number) {
  return [];
}

export const LEVEL_1: Level = {
  id: 'level1',
  board: {
    rows: 10,
    cols: 8,
    layout: generateLayout(8, 10),
  }
}
