import {SymbolModel} from './symbol.model';
import {Direction} from './direction.model';

export enum AnimationMode {
  None = 'none',
  Falling = 'falling',
  Landing = 'landing',
  Swapping = 'swapping',
  Clearing = 'clearing',
}

export type AnimationStartEvent = {
  symbolId: string;
  animationName: string;
}
export type AnimationDoneEvent = {
  symbolId: string;
  animationName: string;
}

export type AnimationCallback = () => void;

export interface SymbolAnimationRequest {
  mode: AnimationMode;
  symbol: SymbolModel;
  params?: {
    fallingFrom?: number,
    swapDirection?: Direction;
  };
  onDone?: AnimationCallback;
}
