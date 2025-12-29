import {Board} from '../../features/board/models/board.model';
import {GameState} from '../../features/game/stores/game-store/game.state';
import {PlayerState} from '../../features/player/store/player.state';
import {DialogState} from './dialog-store/dialog.state';
import {EventState} from '../../features/game/stores/event-store/event.state';

export interface AppState {
  board: Board | null;
  game: GameState;
  player: PlayerState;
  dialog: DialogState;
  event: EventState;
}
