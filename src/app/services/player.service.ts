import { Injectable } from '@angular/core';
import {LeaderboardEntry, LS_KEYS} from '../models/leaderboard.model';
import {LEADERBOARD_ENTRIES} from '../utils/constants';
import {GlobalLeaderboardService} from './global-leaderboard.service';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {


  constructor(
    private authService: AuthService,
    private globalLeaderboard: GlobalLeaderboardService
  ) { }


  getEntryKey(entry: LeaderboardEntry): string {
    const uidPart = entry.uid ?? 'unknown';
    const sessionPart = entry.sessionId ?? 'no-session';
    return `${uidPart}-${sessionPart}`;
  }

  getPlayerName(): string | null {
    let name = localStorage.getItem(LS_KEYS.PLAYER_NAME);
    return name && name.trim() ? name : null;
  }

  setPlayerName(name: string) {
    localStorage.setItem(LS_KEYS.PLAYER_NAME, name.trim());
  }

  getPlayerUid(): string | null {
    return this.authService.uid;
  }


  getLeaderboard(): LeaderboardEntry[] {
    const json = localStorage.getItem(LS_KEYS.LEADERBOARD);
    let list: LeaderboardEntry[] = json ? JSON.parse(json) : [];

    list = list.map(entry => ({
      uid: entry.uid || this.getPlayerUid() || 'local-' + (entry.sessionId || crypto.randomUUID()),
      name: entry.name || 'Anonymous',
      score: entry.score,
      date: entry.date,
      sessionId: entry.sessionId,
    }));

    return list.sort((a, b) => b.score - a.score);
  }

  async getLeaderboardMerged(): Promise<LeaderboardEntry[]> {
    const localList = this.getLeaderboard();
    const globalList = await this.globalLeaderboard.getTopScores();

    console.log('localList', localList);
    console.log('globalList', globalList);

    const map = new Map<string, LeaderboardEntry>();

    [...localList, ...globalList].forEach(entry => {
      const key = this.getEntryKey(entry);

      const existing = map.get(key);
      if (!existing || entry.score > existing.score || entry.date > existing.date) {
        map.set(key, entry);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.score - a.score);
  }

  addScore(score: number, sessionId: string) {
    if (!score || score <= 0) {
      return;
    }

    const uid = this.getPlayerUid();
    const name = this.getPlayerName();

    if (!uid) {
      console.warn('No UID, cannot submit score globally');
      return;
    }

    if (!name) {
      console.warn('No player name set');
      return;
    }


    const leaderboard = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      uid,
      name,
      score,
      date: Date.now(),
      sessionId
    };

    const key = this.getEntryKey(newEntry);
    const existingIndex = leaderboard.findIndex(e => this.getEntryKey(e) === key);
    if (existingIndex !== -1) {
      if (score > leaderboard[existingIndex].score) {
        leaderboard[existingIndex].score = score;
        leaderboard[existingIndex].date = newEntry.date;
      }
    } else {
      leaderboard.push(newEntry);
    }

    leaderboard.sort((a, b) => b.score - a.score);
    const top= leaderboard.slice(0, LEADERBOARD_ENTRIES);
    localStorage.setItem(LS_KEYS.LEADERBOARD, JSON.stringify(top));

    this.globalLeaderboard.submitScore(newEntry).catch(() => {
      // offline /quota/ iOS safari - ignore safely
    });
  }
}
