import {UI_STRINGS} from './ui-messages.model';

export enum GameEventType {
  HEARING = 'hearing',
  HEARING_CLEAR = 'hearing_clear',
  BURN = 'burn',
  BURN_CLEAR = 'burn_clear',
  CAROUSEL = 'carousel',
  CAROUSEL_CLEAR = 'carousel_clear',
  TWO_PHONES = 'two_phones',
  TWO_PHONES_CLEAR = 'two_phones_clear',

  BOMB = 'bomb',
  BOMB_CLEAR = 'bomb_clear',

  SHUFFLE = 'shuffle',
  SHUFFLE_CLEAR = 'shuffle_clear',
}


export interface GameEvent {
  chance: number;
  type: GameEventType;
  notif?: string;
  durationMs?: number;
  payload?: any;
}


export const EVENT_DURATIONS = {
  none: 0,
  short: 3_000,
  medium: 5_000,
  long: 10_000,
};


export const GAME_EVENTS: Record<GameEventType, GameEvent> = {
  [GameEventType.HEARING]: {
    chance: 0.1,
    type: GameEventType.HEARING,
    durationMs: EVENT_DURATIONS.long,
    notif: UI_STRINGS.hearing,
  },
  [GameEventType.BURN]: {
    chance: 0.25,
    type: GameEventType.BURN,
    durationMs: EVENT_DURATIONS.long,
    notif: UI_STRINGS.burn,
  },
  [GameEventType.CAROUSEL]: {
    chance: 0.25,
    type: GameEventType.CAROUSEL,
    durationMs: EVENT_DURATIONS.medium,
    notif: UI_STRINGS.carousel,
  },
  [GameEventType.TWO_PHONES]: {
    chance: 1,
    type: GameEventType.TWO_PHONES,
    durationMs: EVENT_DURATIONS.long,
    notif: UI_STRINGS.two_phones_notif,
  },

  [GameEventType.BOMB]: {
    chance: 1,
    type: GameEventType.BOMB,
    durationMs: EVENT_DURATIONS.medium,
    notif: UI_STRINGS.bomb_notif,
  },
  [GameEventType.SHUFFLE]: {
    chance: 1,
    type: GameEventType.SHUFFLE,
    durationMs: EVENT_DURATIONS.medium,
    notif: UI_STRINGS.shuffle_notif,
  },

  [GameEventType.HEARING_CLEAR]: {
    chance: 1,
    type: GameEventType.HEARING_CLEAR,
    durationMs: EVENT_DURATIONS.none,
    notif: UI_STRINGS.hearing_clear,
  },
  [GameEventType.BURN_CLEAR]: {
    chance: 1,
    type: GameEventType.BURN_CLEAR,
    durationMs: EVENT_DURATIONS.none,
    notif: UI_STRINGS.burn_clear
  },
  [GameEventType.CAROUSEL_CLEAR]: {
    chance: 1,
    type: GameEventType.CAROUSEL_CLEAR,
    durationMs: EVENT_DURATIONS.none,
    notif: UI_STRINGS.carousel_clear,
  },
  [GameEventType.TWO_PHONES_CLEAR]: {
    chance: 1,
    type: GameEventType.TWO_PHONES_CLEAR,
    durationMs: EVENT_DURATIONS.none,
  },
  [GameEventType.BOMB_CLEAR]: {
    chance: 1,
    type: GameEventType.BOMB_CLEAR,
    durationMs: EVENT_DURATIONS.none,
  },
  [GameEventType.SHUFFLE_CLEAR]: {
    chance: 1,
    type: GameEventType.SHUFFLE_CLEAR,
    durationMs: EVENT_DURATIONS.none,
  },
};

export const clearTypeKey = (type: GameEventType) => (type + '_clear') as GameEventType;
