import {Direction} from './direction.model';

/**
 * High-level animation types understood by the GAME.
 */
export enum AnimationType {
  Swapping = 'swapping',
  Falling = 'falling',
  Clearing = 'clearing',
}

/**
 * Rendering modes used by the VIEW (Angular animations)
 * These map directly to animation triggers / states
 */
export enum AnimationRenderMode {
  None = 'none',
  Swapping = 'swapping',
  Falling = 'falling',
  Clearing = 'clearing',
}

export interface AnimationParams {
  fallingFrom?: number,
  x?: string;
  y?: string;
}

export interface SymbolAnimation {
  symbolId: string;
  renderMode: AnimationRenderMode;
  params?: AnimationParams;
}

/**
 * A transactional animation group.
 * The GAME waits for this to fully complete.
 */
export interface AnimationTransaction {
  /**
   *  Unique id for this animation transaction.
   */
  id: string;

  /**
   *  What kind of animation this represents
   */
  type: AnimationType;

  /**
   * All symbol animations involved in this transaction.
   */
  animations: SymbolAnimation[];

  /**
   * Symbol ids that have completed their animations
   */
  completed: Set<string>;
}

/**
 * Events emitted by the AnimationService.
 * These are game-level signals, NOT Angular events.
 */
export interface AnimationEvents {
  onTransactionStart?: (tx: AnimationTransaction) => void;
  onTransactionComplete?: (tx: AnimationTransaction) => void;
}
