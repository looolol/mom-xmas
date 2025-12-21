import { Injectable } from '@angular/core';
import {LeaderboardEntry, LS_KEYS} from '../models/leaderboard.model';
import {LEADERBOARD_ENTRIES} from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  getPlayerName(): string | null {
    let name = localStorage.getItem(LS_KEYS.PLAYER_NAME);
    return name && name.trim() ? name : null;
  }

  setPlayerName(name: string) {
    localStorage.setItem(LS_KEYS.PLAYER_NAME, name.trim());
  }

  getLeaderboard(): LeaderboardEntry[] {
    const json = localStorage.getItem(LS_KEYS.LEADERBOARD);
    const list: LeaderboardEntry[] = json ? JSON.parse(json) : [];
    return list.sort((a, b) => b.score - a.score);
  }

  addScore(score: number, sessionId: string) {
    if (!score || score <= 0) {
      return;
    }

    const leaderboard = this.getLeaderboard();

    const name = this.getPlayerName();
    if (!name) return;

    const existingEntry = leaderboard.find(e => e.sessionId === sessionId);

    if (existingEntry) {
      if (score > existingEntry.score) {
        existingEntry.score = score;
        existingEntry.date = Date.now();
      }
    } else {
      leaderboard.push({ name, score, date: Date.now(), sessionId });
    }

    leaderboard.sort((a, b) => b.score - a.score);

    const top = leaderboard.slice(0, LEADERBOARD_ENTRIES);
    localStorage.setItem(LS_KEYS.LEADERBOARD, JSON.stringify(top));
  }
}
