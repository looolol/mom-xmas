import {SYMBOLS} from '../../../core/utils/constants';

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


export function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

export function randomSymbolExcluding(forbidden: Set<string>): string {
  const options = SYMBOLS.filter(s => !forbidden.has(s));
  return options[Math.floor(Math.random() * options.length)]
}
