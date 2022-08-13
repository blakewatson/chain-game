export const VIEW_W = 800;
export const VIEW_H = 600;

// Game rules and mechanics
export const INITIAL_TURNS = 50;
export const LETTER_SCORES = {
  a: 1,
  b: 3,
  c: 3,
  d: 2,
  e: 1,
  f: 4,
  g: 2,
  h: 4,
  i: 1,
  j: 8,
  k: 5,
  l: 1,
  m: 3,
  n: 1,
  o: 1,
  p: 3,
  q: 10,
  r: 1,
  s: 1,
  t: 1,
  u: 1,
  v: 4,
  w: 4,
  x: 8,
  y: 4,
  z: 10
};

// Colors
export const COLOR_YELLOW = '#fcf100';
export const COLOR_WHITE = '#ffffff';

export const COLOR_BG = '#00ccff';
export const COLOR_BUTTON_GRADIENT_TOP = '#fff600';
export const COLOR_BUTTON_GRADIENT_BOTTOM = '#d1ab00';
export const COLOR_BUTTON_TEXT = '#736200';
export const COLOR_BUTTON_HOVER_GRADIENT_TOP = '#fffdc2';
export const COLOR_BUTTON_HOVER_GRADIENT_BOTTOM = '#ffda35';
export const COLOR_SLOT = COLOR_WHITE;
export const COLOR_TEXT = '#09596d';
export const COLOR_TEXT_TURN_SCORE = COLOR_WHITE;
export const COLOR_TITLE = COLOR_YELLOW;

// Tiles
export const SHADOW_Y = 6;
export const TILE_W = 60;
export const TILE_H = 70 + SHADOW_Y;
export const TILE_W_FULL = TILE_W + 2;
export const TILE_H_FULL = TILE_H + SHADOW_Y + 3;

// Board
export const SLOT_W = TILE_W_FULL * 1.25;
export const SLOT_H = TILE_H_FULL + TILE_W_FULL * 0.25;
export const TURN_SCORE_TEXT_Y = VIEW_H / 2 - TILE_H - 50;

// Events
export const HELP_CLICK = 'help-click';
export const PLAY_CLICK = 'play-click';
export const STATS_CLICK = 'stats-click';
export const TILE_CLICK = 'tile-click';
