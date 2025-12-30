import { DialogIntent } from '../../../../core/models/dialog.model';
import { Board } from '../../../board/models/board.model';
import {GameEventType} from '../../models/event.model';
import {GamePhase} from '../../models/game.model';

export interface GameState {
  phase: GamePhase;
  score: number;
  board: Board;
  events: GameEventType[];
  dialogs: DialogIntent[];
}
