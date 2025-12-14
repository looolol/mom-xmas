export interface SymbolModel {
  id: string;
  kind: string; // emoji or later sprite id
  fallingFrom: number; // for animation
  removing?: boolean;
}
