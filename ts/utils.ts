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
