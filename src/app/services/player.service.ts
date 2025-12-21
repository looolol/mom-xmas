import { Injectable } from '@angular/core';
import {LeaderboardEntry, LS_KEYS} from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  getPlayerName(): string {
    let name = localStorage.getItem(LS_KEYS.PLAYER_NAME);
    if (!name) {
      name = 'Player';
      localStorage.setItem(LS_KEYS.PLAYER_NAME, name);
    }
    return name;
  }

  setPlayerName(name: string) {
    localStorage.setItem(LS_KEYS.PLAYER_NAME, name.trim());
  }

  getLeaderboard(): LeaderboardEntry[] {
    const json = localStorage.getItem(LS_KEYS.LEADERBOARD);
    const list: LeaderboardEntry[] = json ? JSON.parse(json) : [];
    return list.sort((a, b) => b.score - a.score);
  }

  addScore(score: number) {
    const leaderboard = this.getLeaderboard();

    leaderboard.push({ name: this.getPlayerName(), score, date: Date.now() });
    leaderboard.sort((a, b) => b.score - a.score);

    const top10 = leaderboard.slice(0, 10);

    localStorage.setItem(LS_KEYS.LEADERBOARD, JSON.stringify(top10));
  }
}
