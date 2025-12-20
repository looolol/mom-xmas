import { Injectable } from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import { GameEvent } from '../models/event.model';
import {DialogService} from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private eventSubject = new Subject<GameEvent>();
  events$: Observable<GameEvent> = this.eventSubject.asObservable();


   constructor(
     private dialogService: DialogService
   ) { }


  emit(event: GameEvent) {
    console.log('Emitting event', event.type, event);
    this.eventSubject.next(event);

    // If event has duration, emit a 'clear' event after duration
    if (event.durationMs) {
      timer(event.durationMs).subscribe(() => {
        console.log('Emitting event cleared', event.type, event);

        this.eventSubject.next({ type: `${event.type}_CLEAR` });
        switch (event.type) {
          case 'HEARING_LOSS':
            this.dialogService.showNotifications('Hearing restored.', 3000);
            break;
          default:
            this.dialogService.showNotifications(`Event ${event.type} cleared.`, event.durationMs ?? 3000);
        }
      });
    }
  }
}
