import { Ticker } from 'pixi.js';
import Game from './Game';

const fontFace = new FontFace(
  'Ships Whistle',
  'url(../fonts/ShipsWhistle-Bold.woff2'
);
fontFace.load().then((font) => {
  (document.fonts as any).add(font);
  main();
});

function main() {
  const ticker = Ticker.shared;
  ticker.autoStart = false;
  ticker.stop();
  const game = new Game(ticker);
}
