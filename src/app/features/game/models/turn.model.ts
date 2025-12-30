import {BoardChange} from '../../board/models/board.result.model';
import {DialogIntent} from '../../../core/models/dialog.model';
import {GameEventType} from './event.model';
import {AnimationPhase} from '../../../animations/models/animation.model';


export interface TurnResult {
  changes: BoardChange[];
  scoreDelta: number;
  dialogs: DialogIntent[];
  events: GameEventType[];
  animationPhase?: AnimationPhase
}

export interface TurnContext {
  combo: number;
  twoPhonesActive: boolean;
}
