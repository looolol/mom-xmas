export enum GameEventType {
  HEARING = 'hearing',
  HEARING_CLEAR = 'hearing_clear',
  BURN = 'burn',
  BURN_CLEAR = 'burn_clear',
}


export interface GameEvent {
  type: GameEventType;
  payload?: any;
  durationMs?: number;
}
