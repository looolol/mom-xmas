import {GameAction} from '../../models/game.model';
import {GameState} from './game.state';

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_PHASE':
      return { ...state, phase: action.phase };

    case 'PLAYER_SWAP':
      break;

    case 'RESOLVE_MATCHES':
      break;
  }
}
