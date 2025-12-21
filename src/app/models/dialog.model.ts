export type DialogLine = {
  chance: number;
  text: string;
};

export const dialogLinesBySymbol: Record<string, DialogLine[]> = {
  '🍪': [
    { chance: 0.25, text: '🍪: Burnt Cookies &%#@!' },
  ],
  '🌏': [
    { chance: 0.25, text: '🌏: My Team Lost... Again :(' },
  ],
  '🔥': [
    { chance: 0.25, text: '👨🏼‍🍳: Your a Doughnut!' },
    { chance: 0.25, text: '👨🏼‍🍳: Idiot Sandwich' },
    { chance: 0.25, text: '👨🏼‍🍳: ITS RAW' },
    { chance: 0.25, text: '👨🏼‍🍳: Scalaps are undercooked' },
    { chance: 0.25, text: '👨🏼‍🍳: ITS STILL MOOING' },
    { chance: 0.25, text: '👨🏼‍🍳: Where`s the lamb sauce?' },
    { chance: 0.25, text: '👨🏼‍🍳: Seasoned beautifully' },
  ],
  '🎠': [
    { chance: 0.25, text: '🎠: Lets Ride the Carousel!' },
  ],
  '⭐': [
    { chance: 0.25, text: '⭐: NO, I am your MOTHER!' },
    { chance: 0.25, text: '⭐: Use the force!' },
    { chance: 0.25, text: '⭐: Its a trap!' },
    { chance: 0.25, text: '⭐: Lack of combos is Disturbing' },
  ],
  '😈': [
    { chance: 0.25, text: '😈: Go GeT YoUr LaUnDrY!!!' },
    { chance: 0.25, text: '😈: Do ThE DiShEs!!!' },
    { chance: 0.25, text: '😈: GoInG tO tHe CaR!!!' },
  ],
}
