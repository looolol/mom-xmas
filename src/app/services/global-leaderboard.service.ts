import { Injectable } from '@angular/core';
import {collection, doc, Firestore, getDocs, limit, orderBy, query, setDoc} from '@angular/fire/firestore';
import {LeaderboardEntry} from '../models/leaderboard.model';
import {LEADERBOARD_ENTRIES} from '../utils/constants';
import {Timestamp} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class GlobalLeaderboardService {

  private readonly collectionName = 'leaderboard';

  constructor(
    private firestore: Firestore
  ) { }

  async submitScore(entry: LeaderboardEntry): Promise<void> {
    const key = `${entry.uid}-${entry.sessionId}`
    const ref = doc(this.firestore, this.collectionName, key);

    await setDoc(ref, {
      uid: entry.uid,
      name: entry.name,
      score: entry.score,
      date: Timestamp.fromMillis(entry.date),
    }, { merge: true });
  }

  async getTopScores(): Promise<LeaderboardEntry[]> {
    const ref = collection(this.firestore, this.collectionName);

    const q = query(
      ref,
      orderBy('score', 'desc'),
      limit(LEADERBOARD_ENTRIES)
    );

    const snap = await getDocs(q);

    return snap.docs.map(d => {
      const data = d.data() as any;
      const [uid, sessionId] = d.id.split('-', 2);
      return {
        sessionId,
        uid,
        name: data.name,
        score: data.score,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
      }
    });
  }
}
