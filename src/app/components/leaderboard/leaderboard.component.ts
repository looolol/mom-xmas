import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {PlayerService} from '../../services/player.service';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-leaderboard',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {

  displayedColumns = ['name', 'score', 'date'];
  leaderboard: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<LeaderboardComponent>,
    private playerService: PlayerService,
  ) { }

  ngOnInit() {
    this.leaderboard = this.playerService.getLeaderboard();
  }

  close() {
    this.dialogRef.close();
  }

  protected readonly dispatchEvent = dispatchEvent;
}
