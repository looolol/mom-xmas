import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {CheatSheetComponent} from '../cheat-sheet/cheat-sheet.component';

@Component({
  selector: 'app-start-page',
  imports: [
    CommonModule,
    MatButtonModule,
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {

  @Output() startGame = new EventEmitter<void>();
  @Output() openLeaderboard = new EventEmitter<void>();
  @Output() openSettings = new EventEmitter<void>();
  @Output() cheatSheet = new EventEmitter<CheatSheetComponent>();

  startGameClick() {
    this.startGame.emit();
  }

  openLeaderboardClick() {
    this.openLeaderboard.emit();
  }

  cheatSheetClick() {
    this.cheatSheet.emit();
  }

  openSettingsClick() {
    this.openSettings.emit();
  }
}
