import { BoardConfig } from "../../../board/models/board.model";
import { Cell } from "../../../board/models/cell.model";
import {GamePhase} from '../../models/game.model';
import {GameEventType} from '../../models/event.model';

type GameAction =
  | { type: 'INIT_GAME'; config: BoardConfig }
  | { type: 'PLAYER_SWAP'; a: Cell; b: Cell }
  | { type: 'RESOLVING_MATCHES' }
  | { type: 'SHUFFLE_BOARD' }
  | { type: 'USE_BOMB' }
  | { type: 'UPDATE_PHASE'; phase: GamePhase }
  | { type: 'ADD_EVENTS'; events: GameEventType[] }
  | { type: 'CLEAR_DIALOGS' };
