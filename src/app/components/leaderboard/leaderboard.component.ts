import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {PlayerService} from '../../services/player.service';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-leaderboard',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {

  displayedColumns = ['name', 'score', 'date'];
  leaderboard: any[] = [];
  loading = true;

  constructor(
    private dialogRef: MatDialogRef<LeaderboardComponent>,
    private playerService: PlayerService,
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.leaderboard = await this.playerService.getLeaderboardMerged();
    this.loading = false;
  }

  close() {
    this.dialogRef.close();
  }
}
