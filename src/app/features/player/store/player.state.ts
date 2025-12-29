export interface PlayerState {
  name: string | null;
  highScores: Record<string, number>; // sessionId => score
}
