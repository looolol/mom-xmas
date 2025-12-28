export interface BoardStyleParams {
  cellSizePx: number;
  cellGapPx: number;
  boardPaddingPx: number;
  rows: number;
  cols: number;
}

export class BoardStyle implements BoardStyleParams {
  constructor(
    public cellSizePx: number,
    public cellGapPx: number,
    public boardPaddingPx: number,
    public rows: number,
    public cols: number
  ) { }

  getCellPosition(index: number): { x: number; y: number } {
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);
    const x = col * (this.cellSizePx + this.cellGapPx);
    const y = row * (this.cellSizePx + this.cellGapPx);
    return { x, y }
  }
}
