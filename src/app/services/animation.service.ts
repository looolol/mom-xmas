import { Injectable } from '@angular/core';
import {AnimationCallback, AnimationMode, SymbolAnimationRequest} from '../models/animation.model';
import {SymbolModel} from '../models/symbol.model';
import {BehaviorSubject, generate} from 'rxjs';

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}

interface PendingAnimation {
  symbolsDone: Set<string>;
  symbols: string[];
  callback: AnimationCallback;
}

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  private readonly _isAnimating$ = new BehaviorSubject(false);
  readonly isAnimating$ = this._isAnimating$.asObservable();

  private pending = new Map<string, PendingAnimation>();


  get isAnimating(): boolean | null {
    return this._isAnimating$.getValue();
  }

  private updateIsAnimating(isAnimating: boolean) {
    this._isAnimating$.next(isAnimating);
  }

  startAnimation(request: SymbolAnimationRequest & { animationId?: string}) {
    if (!this.canAnimate(request.symbol)) return false;

    this.updateIsAnimating(true);

    const symbol = request.symbol;
    symbol.animationMode = request.mode;
    symbol.fallingFrom = request.params?.fallingFrom ?? -1;
    symbol.swapDirection = request.params?.swapDirection;

    if (request.onDone && request.animationId) {
      let pendingAnim = this.pending.get(request.animationId);
      if (!pendingAnim) {
        pendingAnim = {
          symbolsDone: new Set(),
          symbols: [],
          callback: request.onDone,
        };
        this.pending.set(request.animationId, pendingAnim);
      }
      if (!pendingAnim.symbols.includes(symbol.id)) {
        pendingAnim.symbols.push(symbol.id);
      }
      pendingAnim.callback = request.onDone;
    }

    return true;
  }

  startAnimationAsync(request: SymbolAnimationRequest & { animationId?: string}): Promise<void> {
    return new Promise((resolve, reject) => {
      const ok = this.startAnimation(({ ...request, onDone: resolve }));
      if (!ok) reject('Animation already in progress or cannot start');
    });
  }

  async runPairedAnimation(
    a: SymbolModel,
    b: SymbolModel,
    reqA: SymbolAnimationRequest,
    reqB: SymbolAnimationRequest,
  ) {
    const animationId = generateUniqueId();

    await Promise.all([
      this.startAnimationAsync({ ...reqA, animationId }),
      this.startAnimationAsync({ ...reqB, animationId }),
    ]);
  }

  finishAnimation(symbol: SymbolModel) {
    console.log(`finishAnimation called for symbolId=${symbol.id}`);
    let pendingEntry: PendingAnimation | undefined;
    let animationIdToRemove: string | null = null;

    for (const [animationId, entry] of this.pending.entries()) {
      if (entry.symbols.includes(symbol.id)) {
        pendingEntry = entry;
        animationIdToRemove = animationId;
        break;
      }
    }

    if (!pendingEntry) {
      console.warn(`finishAnimation called multiple times or unknown symbolId=${symbol.id}`);
      console.log('pending animation size', this.pending.size);
      return;
    }

    if (pendingEntry.symbolsDone.has(symbol.id)) {
      console.warn(`finishAnimation called multiple times for symbolId=${symbol.id}`);
      return;
    }

    pendingEntry.symbolsDone.add(symbol.id);

    symbol.animationMode = AnimationMode.None;
    symbol.fallingFrom = -1;
    symbol.swapDirection = undefined;

    // Check if all symbols done
    if (pendingEntry.symbolsDone.size === pendingEntry.symbols.length) {
      // All done, call callback and remove pending
      console.log(`Calling animation callback for animation with symbols ${pendingEntry.symbols.join(', ')}`);
      pendingEntry.callback();

      if (animationIdToRemove) {
        this.pending.delete(animationIdToRemove);
      }
      console.log('Animation done');
      this.updateIsAnimating(false);
    } else {
      console.log(`Waiting on other symbols: ${pendingEntry.symbols.filter(id => !pendingEntry!.symbolsDone.has(id)).join(', ')}`);
    }

    console.log('pending animation size', this.pending.size);
  }

  canAnimate(...symbols: Array<{ animationMode: AnimationMode }>) {
    return symbols.every(s => s.animationMode === AnimationMode.None);
  }

}
