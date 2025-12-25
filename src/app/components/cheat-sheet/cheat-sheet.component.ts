import { Component } from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-cheat-sheet',
  imports: [
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './cheat-sheet.component.html',
  styleUrl: './cheat-sheet.component.scss'
})
export class CheatSheetComponent {


  constructor(
    private dialogRef: MatDialogRef<CheatSheetComponent>
  ) { }



}
