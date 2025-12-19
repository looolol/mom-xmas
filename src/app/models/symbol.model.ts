import {randomSymbolExcluding} from '../utils/random-symbol';

export interface SymbolModel  {
  id: string;
  kind: string;
}

export function createSymbol(kind?: string): SymbolModel {
  return {
    id: crypto.randomUUID(),
    kind: kind ?? randomSymbolExcluding(new Set())
  };
}
