import { Ticker } from 'pixi.js';
import Game from './Game';

const fontFace = new FontFace(
  'Ships Whistle',
  'url(../fonts/ShipsWhistle-Bold.woff2'
);

const fontFacePromise = fontFace.load();

fontFacePromise.then((font) => {
  (document.fonts as any).add(font);
});

const wordListPromise = getWordList();

Promise.all([fontFacePromise, wordListPromise]).then(() => main());

function main() {
  const ticker = Ticker.shared;
  ticker.autoStart = false;
  ticker.stop();
  const game = new Game(ticker);
}

async function getWordList() {
  if (localStorage.getItem('chain-wordlist')) {
    return;
  }

  try {
    const resp = await fetch('all-words-alpha.txt');
    const data = await resp.text();

    // setup optimized word list(s) for this game

    // only need 3-7 letter words
    const words = data.split('\n').filter((w) => {
      if (!w || w.length < 3 || w.length > 7) {
        return false;
      }

      return true;
    });

    words.sort((a, b) => b.length - a.length);

    localStorage.setItem('chain-wordlist', JSON.stringify(words));
  } catch (err) {
    console.error(err);
  }
}
