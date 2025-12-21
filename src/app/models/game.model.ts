export enum GamePhase {
  Uninitialized= 'Uninitialized',
  Idle = 'Idle',
  Swapping = 'Swapping',
  ResolvingMatches = 'ResolvingMatches',
  ResolvingDrop = 'ResolvingDrop',
  Filling = 'Filling',
  Shuffling = 'Shuffling',
  GameOver = 'GameOver',
}

export const VALID_TRANSITIONS: Record<GamePhase, readonly GamePhase[]> = {
  [GamePhase.Uninitialized]: [
    GamePhase.Uninitialized,
    GamePhase.Idle
  ],
  [GamePhase.Idle]: [
    GamePhase.Idle,
    GamePhase.Swapping,
    GamePhase.ResolvingMatches,
    GamePhase.Shuffling,
    GamePhase.GameOver
  ],
  [GamePhase.Swapping]: [
    GamePhase.ResolvingMatches,
    GamePhase.Idle,
  ],
  [GamePhase.ResolvingMatches]: [
    GamePhase.ResolvingDrop,
    GamePhase.Idle,
  ],
  [GamePhase.ResolvingDrop]: [
    GamePhase.Filling,
  ],
  [GamePhase.Filling]: [
    GamePhase.ResolvingMatches,
    GamePhase.Idle,
  ],
  [GamePhase.Shuffling]: [
    GamePhase.ResolvingMatches,
    GamePhase.Idle,
  ],
  [GamePhase.GameOver]: [],
}

export function gameModel(current: GamePhase, next: GamePhase): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}
