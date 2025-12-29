import {GameEventType} from '../../models/event.model';

export interface EventState {
  activeEvent: GameEventType | null;
}
