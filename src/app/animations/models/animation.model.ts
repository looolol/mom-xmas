/**
 * Rendering modes used by the VIEW (Angular animations)
 * These map directly to animation triggers / states
 */
export enum AnimationPhase {
  None = 'none',
  Move = 'move',
  Clearing = 'clearing',
  Creating = 'creating',
  FadeOut = 'fade-out',
  FadeIn = 'fade-in',
}

export interface AnimationParams {
  tileSizePx?: number;
  fallingFrom?: number,
  x?: string;
  y?: string;
}

export interface TokenAnimation {
  tokenId: string;
  renderMode: AnimationPhase;
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
   * All symbol animations involved in this transaction.
   */
  animations: TokenAnimation[];

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
