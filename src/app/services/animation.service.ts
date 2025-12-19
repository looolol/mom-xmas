import { Injectable } from '@angular/core';
import {AnimationTransaction, AnimationType, SymbolAnimation} from '../models/animation.model';
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
  async play(type: AnimationType, animations: SymbolAnimation[]): Promise<void> {
    if (this.activeTransaction) {
      await this.activeTransactionPromise;
    }

    // Clear current animations so Angular detects change
    this._symbolAnimation$.next([]);
    await this.nextTick();

    const tx: AnimationTransaction = {
      id: crypto.randomUUID(),
      type,
      animations,
      completed: new Set<string>(),
    }

    this.activeTransaction = tx;
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

    tx.completed.add(symbolId);

    // If all symbols finished, resolve transaction
    if (tx.completed.size === tx.animations.length) {
      this.finishTransaction();
    }
  }

  /**
   * Clears the current transaction and resolves its Promise
   */
  private finishTransaction(): void {
    if (!this.activeTransaction) return;

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

  getActiveTransactionType(): AnimationType | null {
    return this.activeTransaction?.type ?? null;
  }

  private nextTick(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 10));
  }
}
