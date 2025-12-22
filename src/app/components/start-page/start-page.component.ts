import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

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

  startGameClick() {
    this.startGame.emit();
  }

  openLeaderboardClick() {
    this.openLeaderboard.emit();
  }

  openSettingsClick() {
    this.openSettings.emit();
  }
}
