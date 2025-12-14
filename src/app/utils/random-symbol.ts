import { SYMBOLS } from "./constants";

export function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

export function randomSymbolExcluding(forbidden: Set<string>): string {
  const options = SYMBOLS.filter(s => !forbidden.has(s));
  return options[Math.floor(Math.random() * options.length)]
}
