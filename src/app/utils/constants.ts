export const SYMBOLS = [
  '🍪', '🌏', '🔥',  '🎠',  '⭐', '😈',
];
export const DEFAULT_SYMBOLS = SYMBOLS[0];

export const MATCH_CHECK_DEPTH = 2;

export const TILE_SIZE_PX = getTileSizePx();

export const POINTS_PER_CELL = 10;

function getTileSizePx(): number {
  const width = window.innerWidth;

  if (width < 360) return 28;  // very small phones
  if (width < 480) return 32;  // small phones
  if (width < 768) return 40;  // tablets in portrait
  if (width < 1024) return 48; // tablets/large phones landscape
  return 64;                   // desktops/large tablets
}
