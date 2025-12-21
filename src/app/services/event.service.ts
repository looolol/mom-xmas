import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {GameEvent, GameEventDialog, GameEventType} from '../models/event.model';
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
        this.clearEvent(event.type);
      });
    }

    return true;
  }

  private clearEvent(type: GameEventType) {
    switch (type) {
      case GameEventType.HEARING:
        this.eventSubject.next({ type: GameEventType.HEARING_CLEAR });
        this.dialogService.showNotifications(GameEventDialog.HEARING_CLEAR, 3000);
        break;
      case GameEventType.BURN:
        this.eventSubject.next({ type: GameEventType.BURN_CLEAR});
        this.dialogService.showNotifications(GameEventDialog.BURN_CLEAR, 3000);
        break;
      case GameEventType.CAROUSEL:
        this.eventSubject.next({ type: GameEventType.CAROUSEL_CLEAR });
        this.dialogService.showDialog(GameEventDialog.CAROUSEL_CLEAR_DIALOG, 3000);
        this.dialogService.showNotifications(GameEventDialog.CAROUSEL_CLEAR, 3000);
        break;
      case GameEventType.HEARING_CLEAR:
      case GameEventType.BURN_CLEAR:
      case GameEventType.CAROUSEL_CLEAR:
        break;
      default:
        this.dialogService.showNotifications(`Event ${type} cleared.`, 3000);
    }

    this.activeEvent = null;
  }
}
