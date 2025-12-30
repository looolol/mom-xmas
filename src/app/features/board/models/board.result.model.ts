import {Board} from './board.model';
import {Position} from '../../../core/models/position.model';
import {TokenType} from './token';
import {Cell} from './cell.model';

export interface BoardResult {
  board: Board;
  changes: Cell[];
}

export type BoardChange =
  | TokenMovedChange
  | CellClearedChange
  | TokenSpawnedChange
  | ShuffleChange;


export interface TokenMovedChange {
  type: 'token-moved';
  tokenId: string;
  from: Position;
  to: Position;
}

export interface CellClearedChange {
  type: 'cell-cleared';
  position: Position;
  tokenId: string;
}

export interface TokenSpawnedChange {
  type: 'token-spawned';
  position: Position;
  tokenId: string;
  kind: TokenType;
}

export interface ShuffleChange {
  type: 'shuffle';
}
