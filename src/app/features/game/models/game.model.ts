export enum GamePhase {
  Uninitialized= 'Uninitialized',
  Idle = 'Idle',
  Swapping = 'Swapping',
  ResolvingMatches = 'ResolvingMatches',
  ResolvingDrop = 'ResolvingDrop',
  Filling = 'Filling',
  Shuffling = 'Shuffling',
  Bomb = "Bomb",
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
    GamePhase.Bomb,
    GamePhase.Uninitialized,
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
  [GamePhase.Bomb]: [
    GamePhase.ResolvingMatches,
    GamePhase.Idle,
  ],
}

export function gameModel(current: GamePhase, next: GamePhase): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}
