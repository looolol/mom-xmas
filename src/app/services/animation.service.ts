import {Injectable} from '@angular/core';
import {AnimationTransaction, SymbolAnimation} from '../models/animation.model';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  private activeTransaction: AnimationTransaction | null = null;
  private activeTransactionPromise: Promise<void> | null = null;
  private activeTransactionResolve: (() => void) | null = null;

  private readonly _symbolAnimation$ = new BehaviorSubject<SymbolAnimation[]>([]);
  readonly symbolAnimation$ = this._symbolAnimation$.asObservable();

  private readonly _isAnimating$ = new BehaviorSubject<boolean>(false);
  readonly isAnimating$ = this._isAnimating$.asObservable();

  /**
   * Play a full animation transaction.
   * Resolves ONLY when all symbols have finished animating.
   */
  async play(animations: SymbolAnimation[]): Promise<void> {
    console.log('Playing animation...', animations);
    if (this.activeTransaction) {
      await this.activeTransactionPromise;
    }

    console.log('Play done waiting...');

    // Clear current animations so Angular detects change
    this._symbolAnimation$.next([]);
    await this.nextTick();


    this.activeTransaction = {
      id: crypto.randomUUID(),
      animations,
      completed: new Set<string>(),
    };
    console.log('Starting animation...');
    this._isAnimating$.next(true);

    // Emit animations to the UI
    this._symbolAnimation$.next(animations);

    this.activeTransactionPromise = new Promise<void>((resolve) => {
      this.activeTransactionResolve = resolve;
    })

    return this.activeTransactionPromise;
  }

  /**
   * Called by SymbolComponent when an animation for a symbol finishes.
   */
  notifySymbolDone(symbolId: string): void {
    const tx = this.activeTransaction;
    if (!tx) return;

    // Ignore symbols not part of this transaction
    if (!tx.animations.some(a => a.symbolId === symbolId)) {
      return;
    }

    // Ignore duplicate completions
    if (tx.completed.has(symbolId)) {
      return;
    }

    console.log('Notify symbol done.', symbolId);
    tx.completed.add(symbolId);

    // If all symbols finished, resolve transaction
    if (tx.completed.size === tx.animations.length) {
      this.finishTransaction();
    }
  }

  /**
   * Clears the current transaction and resolves its Promise
   */
  private async finishTransaction(): Promise<void> {
    if (!this.activeTransaction) return;

    console.log("FINISHED ANIMATION TRANSACTION", this.activeTransaction);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Clear state BEFORE resolving (prevents reentrancy bugs)
    this.activeTransaction = null;
    this._symbolAnimation$.next([]);
    this._isAnimating$.next(false);

    if (this.activeTransactionResolve) {
      this.activeTransactionResolve();
    }

    // Resolve Promise
    this.activeTransactionResolve = null;
    this.activeTransactionPromise = null;
  }

  /**
   * Convenience helpers
   */
  isAnimating(): boolean {
    return this._isAnimating$.getValue();
  }

  private async nextTick(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 10));
  }
}
