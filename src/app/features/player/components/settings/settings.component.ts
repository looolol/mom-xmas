import { Component } from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {PlayerService} from '../../services/player.service';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  playerName: string = '';


  constructor(
    private dialogRef: MatDialogRef<SettingsComponent>,
    private playerService: PlayerService
  ) {
    this.playerName = this.playerService.getPlayerName() || '';
  }


  get isNameValid(): boolean {
    return this.playerName.trim().length > 0;
  }

  save() {
    if (this.isNameValid) {
      this.playerService.setPlayerName(this.playerName.trim());
      this.dialogRef.close(true);
    }
  }
}
