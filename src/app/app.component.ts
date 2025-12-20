import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BoardComponent} from './components/board/board.component';
import {GamePageComponent} from './components/game-page/game-page.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    GamePageComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mom-xmas';
}
