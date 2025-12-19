import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private readonly _dialogText$ = new BehaviorSubject<string | null>(null);
  readonly dialogText$ = this._dialogText$.asObservable();


  constructor() { }


  showDialog(text: string, durationMs = 3000) {
    this._dialogText$.next(text);
    setTimeout(() => this._dialogText$.next(null), durationMs);
  }
}
