import { Injectable } from '@angular/core';
import {AnimationCallback, AnimationMode, SymbolAnimationRequest} from '../models/animation.model';
import {SymbolModel} from '../models/symbol.model';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  private pending = new Map<string, AnimationCallback>();

  startAnimation(request: SymbolAnimationRequest): boolean {
    const symbol = request.symbol;

    if (!this.canAnimate(symbol)) return false;

    symbol.animationMode = request.mode;
    symbol.fallingFrom = request.params?.fallingFrom ?? -1;
    symbol.swapDirection = request.params?.swapDirection;

    if (request.onDone) {
      this.pending.set(symbol.id, request.onDone);
    }

    return true;
  }

  startAnimationAsync(request: SymbolAnimationRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      const ok = this.startAnimation(({ ...request, onDone: resolve }));
      if (!ok) reject('Animation already in progress');
    });
  }

  async runPairedAnimation(
    a: SymbolModel,
    b: SymbolModel,
    reqA: SymbolAnimationRequest,
    reqB: SymbolAnimationRequest,
  ) {
    await Promise.all([
      this.startAnimationAsync(reqA),
      this.startAnimationAsync(reqB)
    ]);
  }

  finishAnimation(symbol: SymbolModel) {
    const cb = this.pending.get(symbol.id);
    this.pending.delete(symbol.id);

    symbol.animationMode = AnimationMode.None;
    symbol.fallingFrom = -1;
    symbol.swapDirection = undefined;

    cb?.();
  }

  canAnimate(...symbols: Array<{ animationMode: AnimationMode }>) {
    return symbols.every(s => s.animationMode === AnimationMode.None);
  }

}
