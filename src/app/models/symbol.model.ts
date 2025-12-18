import {AnimationMode} from './animation.model';
import {randomSymbolExcluding} from '../utils/random-symbol';
import {FALLING_FROM_OFFBOARD} from '../utils/constants';
import {Direction} from './direction.model';

export class SymbolModel {
  constructor (
    public id: string,
    public kind: string, // emoji or later sprite id
    public animationMode: AnimationMode,
    public fallingFrom: number, // for animation
    public swapDirection?: Direction,
  ) { }

  canAnimate(): boolean {
    return this.animationMode !== AnimationMode.None;
  }

  getKind(): string {
    return this.kind;
  }
}

export function createSymbol(symbolKind?: string, forbidden = new Set<string>()) {
  return new SymbolModel(
    crypto.randomUUID(),
    symbolKind ? symbolKind : randomSymbolExcluding(forbidden),
    AnimationMode.None,
    FALLING_FROM_OFFBOARD,
  );
}
