export const LS_KEYS = {
  PLAYER_NAME: 'momXmasSwap_playerName',
  LEADERBOARD: 'momXmasSwap_leaderboard',
}

export interface LeaderboardEntry {
  uid: string,
  name: string;
  score: number;
  date: number;
  sessionId: string;
  rank?: number;
}
