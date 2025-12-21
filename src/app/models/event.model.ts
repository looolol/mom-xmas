export enum GameEventType {
  HEARING = 'hearing',
  HEARING_CLEAR = 'hearing_clear',
  BURN = 'burn',
  BURN_CLEAR = 'burn_clear',
  CAROUSEL = 'carousel',
  CAROUSEL_CLEAR = 'carousel_clear',
}


export interface GameEvent {
  type: GameEventType;
  payload?: any;
  durationMs?: number;
}


export enum GameEventDialog {
  HEARING = '👂🏻🚫: What??? Pieces are misheard for a while...',
  HEARING_CLEAR = '👂🏻: Hearing restored.',
  BURN = '🍪🔥: MOM THE COOKIES!!!',
  BURN_CLEAR = '🧯💨 🧯💨 🧯💨',
  CAROUSEL = '🎠🎶: RIDE STARTED',
  CAROUSEL_CLEAR_DIALOG = '🤢 Everything stops spinning...',
  CAROUSEL_CLEAR = '🎠: RIDE OVER',

}
