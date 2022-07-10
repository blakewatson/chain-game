import { utils } from 'pixi.js';

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
