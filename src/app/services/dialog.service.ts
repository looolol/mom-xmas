import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UI_DISPLAY_DURATIONS} from '../models/ui-messages.model';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private readonly _dialogText$ = new BehaviorSubject<string | null>(null);
  readonly dialogText$ = this._dialogText$.asObservable();

  private _notifications$ = new BehaviorSubject<string | null>(null);
  notifications$ = this._notifications$.asObservable();


  showDialog(text: string, durationMs = UI_DISPLAY_DURATIONS.medium) {
   this._dialogText$.next(text);
   setTimeout(() => this.clearDialog(), durationMs);
  }

  clearDialog() {
    this._dialogText$.next(null);
  }


  showNotifications(text: string, durationMs = UI_DISPLAY_DURATIONS.long) {
    this._notifications$.next(text);
    setTimeout(() => this.clearNotifications(), durationMs)
  }

  clearNotifications() {
    this._notifications$.next(null);
  }
}
