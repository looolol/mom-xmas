import { Component } from '@angular/core';
import {GamePageComponent} from './components/game-page/game-page.component';
import {StartPageComponent} from './components/start-page/start-page.component';
import {CommonModule} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {SettingsComponent} from './components/settings/settings.component';
import {LeaderboardComponent} from './components/leaderboard/leaderboard.component';
import {PlayerService} from './services/player.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    StartPageComponent,
    GamePageComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mom-xmas';

  gameStarted =  false;

  constructor(
    private playerService: PlayerService,
    private dialog: MatDialog,
  ) { }


  onStartGame() {
    this.gameStarted = true;
  }

  onOpenLeaderboard() {

    const ref = this.dialog.open(LeaderboardComponent, {
      width: '90%',
      maxWidth: '400px',
      disableClose: true,
    });
  }

  onOpenSettings() {

    this.dialog.open(SettingsComponent, {
      width: '90%',
      maxWidth: '400px',
      disableClose: true,
    }).afterClosed().subscribe(result => {
      if (!this.playerService.getPlayerName()) {
        // invalid name, prompt again
        this.onOpenSettings();
        return;
      }

      this.playerService.syncLocalToGlobal();
    });
  }

  onQuitGame() {
    this.gameStarted = false;
  }
}
