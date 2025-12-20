export type DialogLine = {
  chance: number;
  text: string;
};

export const dialogLinesBySymbol: Record<string, DialogLine[]> = {
  '🍪': [
    { chance: 0.75, text: '🍪: Burnt Cookies &%#@!' },
  ],
  '🌏': [
    { chance: 0.75, text: '🌏: My Team Lost... Again :(' },
  ],
  '🔥': [
    { chance: 0.75, text: '👨🏼‍🍳: Your a Doughnut!' },
  ],
  '🎠': [
    { chance: 0.75, text: '🎠: Carousel' },
  ],
  '⭐': [
    { chance: 0.75, text: '⭐: NO, I am your MOTHER!' },
  ],
  '😈': [
    { chance: 0.75, text: '😈: Go GeT YoUr LaUnDrY!!!' },
  ],
}
