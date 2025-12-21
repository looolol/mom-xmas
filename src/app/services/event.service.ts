import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {
  clearTypeKey,
  GAME_EVENTS,
  GameEvent,
  GameEventType
} from '../models/event.model';
import {DialogService} from './dialog.service';
import {UI_DISPLAY_DURATIONS} from '../models/ui-messages.model';

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


  emit(gameEvent: GameEvent): boolean {
    if (gameEvent.type.endsWith('_clear')) {
      console.log(`Ignoring attempt to emit clear event type: ${gameEvent.type}`);
      return false;
    }

    if (this.activeEvent) {
      console.log( 'Ignoring event', gameEvent, 'because', this.activeEvent, 'isActive');
      return false;
    }

    console.log('Emitting event', gameEvent.type, gameEvent);
    this.activeEvent = gameEvent.type;
    this.eventSubject.next(gameEvent);

    if (gameEvent.notif) {
      this.dialogService.showNotifications(gameEvent.notif, UI_DISPLAY_DURATIONS.long);
    }

    // If event has duration, emit a 'clear' event after duration
    if (gameEvent.durationMs) {
      timer(gameEvent.durationMs).subscribe(() => {
        console.log('Emitting event cleared', gameEvent.type, gameEvent);
        this.clearEvent(gameEvent.type);
      });
    }

    return true;
  }

  private clearEvent(type: GameEventType) {
    const clearType = clearTypeKey(type);
    if (!(clearType in GAME_EVENTS)) {
      this.dialogService.showNotifications(`Event ${type} cleared.`, UI_DISPLAY_DURATIONS.medium);
      this.activeEvent = null;
      return;
    }

    const clearEvent = GAME_EVENTS[clearType];

    this.eventSubject.next(clearEvent);
    if (clearEvent.notif) {
      this.dialogService.showNotifications(clearEvent.notif, UI_DISPLAY_DURATIONS.long);
    }

    this.activeEvent = null;
  }
}
