import {Direction} from './direction.model';
import {AnimationMode} from './animation.model';

export interface SymbolModel {
  id: string;
  kind: string; // emoji or later sprite id
  animationMode: AnimationMode;
  fallingFrom: number; // for animation
  swapDirection?: Direction;
}
