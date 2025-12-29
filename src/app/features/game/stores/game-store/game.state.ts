import {GamePhase} from '../../models/game.model';

export interface GameState {
  phase: GamePhase | null;
  score: number;
  shuffleCount: number;
  bombCount: number;
  twoPhonesActive: boolean;
}
