import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {StartPageComponent} from './core/components/start-page/start-page.component';
import {GamePageComponent} from './features/game/components/game-page/game-page.component';
import {PlayerService} from './features/player/services/player.service';
import {LeaderboardComponent} from './features/player/components/leaderboard/leaderboard.component';
import {CheatSheetComponent} from './features/game/components/cheat-sheet/cheat-sheet.component';
import {SettingsComponent} from './features/player/components/settings/settings.component';

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

  onOpenCheatSheet() {
    const ref = this.dialog.open(CheatSheetComponent, {
      width: '90%',
      maxWidth: '400px',
      disableClose: false,
    })
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
