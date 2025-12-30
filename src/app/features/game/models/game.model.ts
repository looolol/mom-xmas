import {Cell} from '../../board/models/cell.model';

export enum GamePhase {
  Uninitialized,
  Idle,
  Swapping,
  Resolving,
  GameOver,
}

export const validGamePhaseTransitions: Record<GamePhase, GamePhase[]> = {
  [GamePhase.Uninitialized]: [
    GamePhase.Idle,
  ],
  [GamePhase.Idle]: [
    GamePhase.Swapping,
    GamePhase.GameOver,
  ],
  [GamePhase.Swapping]: [
    GamePhase.Resolving,
    GamePhase.Idle,
  ],
  [GamePhase.Resolving]: [
    GamePhase.Idle,
  ],
  [GamePhase.GameOver]: [],
}


export type GameAction =
  | { type: 'UPDATE_PHASE'; phase: GamePhase }
  | { type: 'PLAYER_SWAP'; a: Cell; b: Cell }
  | { type: 'RESOLVE_MATCHES' }
  | { type: 'SHUFFLE_BOARD' }
  | { type: 'USE_BOMB' };
