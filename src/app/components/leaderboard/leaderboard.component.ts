import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {PlayerService} from '../../services/player.service';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-leaderboard',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTooltipModule,
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this._sort = sort;
    if (this._sort) {
      this.leaderboard.sort = this._sort;
    }
  }
  private _sort!: MatSort;

  displayedColumns = ['name', 'score', 'date'];
  leaderboard = new MatTableDataSource<any>();
  loading = true;

  constructor(
    private dialogRef: MatDialogRef<LeaderboardComponent>,
    private playerService: PlayerService,
  ) { }

  async ngOnInit() {
    this.loading = true;
    const data = await this.playerService.getLeaderboardMerged();

    data.sort((a, b) => b.score - a.score);

    data.forEach((entry, index) => {
      if (index === 0) entry.rank = 1;
      else if (index === 1) entry.rank = 2;
      else if (index === 2) entry.rank = 3;
      else entry.rank = undefined;
    });

    console.log(data);

    this.leaderboard.data = data;
    this.loading = false;
  }

  close() {
    this.dialogRef.close();
  }
}
