import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {GameEvent, GameEventType} from '../models/event.model';
import {DialogService} from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private eventSubject = new Subject<GameEvent>();
  events$: Observable<GameEvent> = this.eventSubject.asObservable();

  private activeEvent: GameEventType | null = null;

  get isEventActive(): boolean {
    return this.activeEvent !== null;
  }

  get currentEvent(): GameEventType | null {
    return this.activeEvent;
  }


   constructor(
     private dialogService: DialogService
   ) { }


  emit(event: GameEvent): boolean {
    if (this.activeEvent) {
      console.log( 'Ignoring event', event.type, 'because', this.activeEvent, 'isActive');
      return false;
    }

    console.log('Emitting event', event.type, event);
    this.activeEvent = event.type;
    this.eventSubject.next(event);

    // If event has duration, emit a 'clear' event after duration
    if (event.durationMs) {
      timer(event.durationMs).subscribe(() => {
        console.log('Emitting event cleared', event.type, event);

        switch (event.type) {
          case GameEventType.HEARING:
            this.eventSubject.next({ type: GameEventType.HEARING_CLEAR });
            this.dialogService.showNotifications('Hearing restored.', 3000);
            break;
          case GameEventType.BURN:
            this.eventSubject.next({ type: GameEventType.BURN_CLEAR});
            this.dialogService.showNotifications('🧯💨 🧯💨 🧯💨', 3000);
            break;
          case GameEventType.HEARING_CLEAR,
            GameEventType.BURN_CLEAR:
            break;
          default:
            this.dialogService.showNotifications(`Event ${event.type} cleared.`, event.durationMs ?? 3000);
        }

        this.activeEvent = null;
      });
    }

    return true;
  }
}
