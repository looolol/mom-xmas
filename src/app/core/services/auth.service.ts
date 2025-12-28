import { Injectable } from '@angular/core';
import {Auth, signInAnonymously, user} from '@angular/fire/auth';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(private auth: Auth) {}


  async init(): Promise<void> {
    console.log('Logging in...');
    const currentUser = await firstValueFrom(user(this.auth));

    if (!currentUser) {
      await signInAnonymously(this.auth);
    }

    console.log('Logged in!', + (this.uid || 'null'));
  }

  get uid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}
