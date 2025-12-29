import {Board, BoardConfig} from '../models/board.model';
import {LEVEL_1} from '../../game/levels/level1';


export interface BoardState {
  board: Board;
}

export const initialState: BoardState = {
  board: Board.createFromLevel(LEVEL_1),
}
