import {
  Application,
  Container,
  DisplayObject,
  Graphics,
  Ticker
} from 'pixi.js';
import PubSub from 'pubsub-js';
import {
  SLOT_H,
  SLOT_W,
  TILE_CLICK,
  TILE_H,
  TILE_W,
  VIEW_H,
  VIEW_W
} from './constants';
import Tile from './Tile';
import { getRandomLetter } from './utils';

export default class Game {
  public app: Application | null = null;
  public bank: Container | null = null;
  public board: Tile[] = [];
  public boardBg: Container | null = null;
  public h: number = VIEW_H;
  public lastTime: number = 0;
  public preventClicks = false;
  public ticker: Ticker | null = null;
  public tileEntryPoint: { x: number; y: number } = { x: 0, y: 0 };
  public w: number = VIEW_W;

  constructor(ticker: Ticker) {
    this.app = new Application({
      width: VIEW_W,
      height: VIEW_H,
      resolution: window.devicePixelRatio || 1,
      backgroundColor: 0x00ccff
    });

    this.ticker = ticker;

    document.querySelector('#app')?.append(this.app.view);

    this.initBoardBg();
    this.initBank();

    // calculate the position where newly played tiles should go
    const entryPoint = this.boardBg.children.at(-1).getBounds();
    this.tileEntryPoint = {
      x: entryPoint.x,
      y: entryPoint.y
    };

    this.listenForTileClick();

    this.ticker.add(this.update.bind(this));
    this.ticker.start();
  }

  public addChild(...children: DisplayObject[]) {
    this.app?.stage.addChild(...children);
  }

  public initBank() {
    this.bank = new Container();

    const letters: string[] = [];

    for (let i = 0; i < 5; i++) {
      if (i === 0) {
        letters.push(getRandomLetter(true));
        continue;
      }

      letters.push(getRandomLetter());
    }

    letters.map((letter, i) => {
      const tile = new Tile({
        letter,
        x: TILE_W * 1.5 * i,
        y: 0,
        clickable: true
      });

      this.bank.addChild(tile);
    });

    this.addChild(this.bank);
    this.bank.x = VIEW_W / 2 - this.bank.width / 2;
    this.bank.y = VIEW_H / 2 + TILE_H;
  }

  public initBoardBg() {
    this.boardBg = new Container();

    for (let i = 0; i < 7; i++) {
      const rect = new Graphics();
      rect.beginFill(0xffffff);
      rect.drawRoundedRect(i * SLOT_W * 1.125, 0, SLOT_W, SLOT_H, 16);
      rect.endFill();
      rect.alpha = 0.5;
      this.boardBg.addChild(rect);
    }

    this.addChild(this.boardBg);
    this.boardBg.x = VIEW_W / 2 - this.boardBg.width / 2;
    this.boardBg.y = VIEW_H / 2 - TILE_H;
  }

  public listenForTileClick() {
    PubSub.subscribe(TILE_CLICK, (msg: string, tile: Tile) => {
      if (this.preventClicks) {
        return;
      }

      this.preventClicks = true;

      const animations = [];

      const currentPosition = {
        x: tile.x,
        y: tile.y
      };

      animations.push(
        tile.moveToPosition(
          this.tileEntryPoint.x + SLOT_W / 2 - tile.width / 2,
          this.tileEntryPoint.y + SLOT_H / 2 - tile.height / 2
        )
      );

      tile.setClickable(false);

      // animate other tiles on the board
      this.board.forEach((boardTile: Tile, i: number) => {
        if (this.board.length === 7 && i === 0) {
          boardTile.exitAnimation();
          return;
        }
        animations.push(boardTile.shiftLeft());
      });

      Promise.all(animations.map((a) => a.finished)).then(() => {
        console.log('animationComplete');
        this.preventClicks = false;
      });

      // add tile to the board
      this.board.push(tile);

      if (this.board.length > 7) {
        this.board.shift();
      }

      // generate new letter tile in place of the one that was just played
      const newTile = new Tile({
        letter: getRandomLetter(),
        x: currentPosition.x,
        y: currentPosition.y,
        clickable: true,
        animateIn: true
      });

      this.bank.addChild(newTile);
    });
  }

  public update(dt: number) {}
}
