import {GameState} from './game.state';

const selectPhase = (state: GameState) => state.phase;
const selectScore = (state: GameState) => state.score;
const selectBoard = (state: GameState) => state.board;
