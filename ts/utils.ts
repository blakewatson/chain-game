import { Texture, utils } from 'pixi.js';

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

export const letterGenerator = () => {
  const initialLetters =
    'aaaaaaaaabbccddddeeeeeeeeeeeefggghiiiiiiiiijkllllmmnnnnnnooooooooppqrrrrrrssssttttttuuuuvwxyz';
  let letters = initialLetters.split('');

  return () => {
    if (!letters.length) {
      letters = initialLetters.split('');
    }

    const i = Math.floor(Math.random() * letters.length);

    const result = letters[i];
    letters.splice(i, 1);

    return result;
  };
};

export const isVowel = (letter: string) =>
  'aeiou'.split('').includes(letter.toLowerCase());

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
