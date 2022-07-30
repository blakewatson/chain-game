import { Texture, utils } from 'pixi.js';
import { INITIAL_TURNS } from './constants';

export const getRandomLetter = (vowelsOnly = false) => {
  const alpha: string[] = [];

  if (vowelsOnly) {
    alpha.push('a', 'e', 'i', 'o', 'u');
  } else {
    alpha.push(...'abcdefghijklmnopqrstuvwxyz'.split(''));
  }

  const i = Math.floor(Math.random() * alpha.length);

  return alpha[i];
};

export interface IColorStop {
  offset: number;
  color: string;
}

export interface IGradientPosition {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface IGradientOptions {
  width: number;
  height: number;
  position: IGradientPosition;
  stops: IColorStop[];
}

export const linearGradient = (options: IGradientOptions) => {
  const { width, height, position, stops } = options;

  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const grd = ctx.createLinearGradient(
    position.x1,
    position.y1,
    position.x2,
    position.y2
  );

  stops.forEach((stop) => grd.addColorStop(stop.offset, stop.color));

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  return Texture.from(c);
};

export const letterGenerator = (rng: () => number) => {
  const initialLetters =
    'aaaaaaaaabbccddddeeeeeeeeeeeefggghiiiiiiiiijkllllmmnnnnnnooooooooppqrrrrrrssssttttttuuuuvwxyz';
  let letters = initialLetters.split('');

  return () => {
    if (!letters.length) {
      letters = initialLetters.split('');
    }

    const i = Math.floor(rng() * letters.length);

    const result = letters[i];
    letters.splice(i, 1);

    return result;
  };
};

export const letterIsVowel = (letter: string) =>
  ['a', 'e', 'i', 'o', 'u', 'y'].includes(letter);

export const letterPreGen = (
  rng: () => number,
  numOfLetters: number = INITIAL_TURNS + 5
) => {
  const getLetter = letterGenerator(rng);
  const letters: string[] = [];
  const weightAmt = 0.2;

  let oddsWipeCons = 0;
  let oddsWipeVowel = 0;

  const wipeLetter = (letter: string) => {
    const val = rng();

    console.log(
      'val',
      val,
      'letter',
      letter,
      'oddsWipeVowel',
      oddsWipeVowel,
      'oddsWipeCons',
      oddsWipeCons
    );

    if (letterIsVowel(letter) && val < oddsWipeVowel) {
      return true;
    }

    if (!letterIsVowel(letter) && val < oddsWipeCons) {
      return true;
    }

    return false;
  };

  for (let i = 0; i < numOfLetters; i++) {
    let letter = getLetter();

    if (wipeLetter(letter)) {
      console.log('wiping letter', letter);
      i--;
      continue;
    }

    if (letterIsVowel(letter)) {
      oddsWipeCons = Math.max(oddsWipeCons - weightAmt, 0);
      oddsWipeVowel += weightAmt;
    } else {
      oddsWipeCons += weightAmt;
      oddsWipeVowel = Math.max(oddsWipeVowel - weightAmt, 0);
    }

    console.log('pushing letter', letter);
    letters.push(letter);
  }

  console.log(letters.join());
  return letters;
};

export function rgbFunctionToHex(rgba: string): string;
export function rgbFunctionToHex(rgba: string, asNumber: true): number;
export function rgbFunctionToHex(
  rgba: string,
  asNumber?: true
): string | number {
  const parts = rgba
    .slice(5, -1)
    .split(',')
    .slice(0, -1)
    .map((_) => parseInt(_) / 255);

  if (asNumber) {
    return utils.rgb2hex(parts);
  }

  return utils.hex2string(utils.rgb2hex(parts));
}
