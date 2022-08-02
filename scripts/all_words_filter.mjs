import { ProfanityEngine } from '@coffeeandfun/google-profanity-words';
import fs from 'fs';

const whitelistedProfanity = ['damn', 'ass'];

const profanity = new ProfanityEngine();

const allWordsData = fs.readFileSync('all-words-alpha.txt', 'utf-8');

const filteredWords = allWordsData
  .split('\n')
  .filter(
    (word) => !(profanity.search(word) && !whitelistedProfanity.includes(word))
  );

fs.writeFileSync('all-words-alpha.txt', filteredWords.join('\n'));
