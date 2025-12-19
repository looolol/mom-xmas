export class Position {
  constructor(public row: number, public col: number) { }

  add(other: Position): Position {
    return new Position(this.row + other.row, this.col + other.col);
  }

  sub(other: Position): Position {
    return new Position(this.row - other.row, this.col - other.col);
  }

  multiply(scalar: number) : Position {
    return new Position(this.row * scalar, this.col * scalar);
  }

  abs(): Position {
    return new Position(Math.abs(this.row), Math.abs(this.col));
  }

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  isValid(maxRows: number, maxCols: number): boolean {
    return this.row >= 0 && this.row < maxRows && this.col >= 0 && this.col < maxCols;
  }

  clone(): Position {
    return new Position(this.row, this.col);
  }
}
