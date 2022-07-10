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
import Text from './Text';
import Tile from './Tile';
import { getRandomLetter } from './utils';

export default class Game {
  public app: Application | null = null;
  public bank: Container | null = null;
  public board: Tile[] = [];
  public boardBg: Container | null = null;
  public combo = 0;
  public h: number = VIEW_H;
  public lastTime: number = 0;
  public preventClicksPromises: Promise<any>[] = [];
  public score = 0;
  public ticker: Ticker | null = null;
  public tileEntryPoint: { x: number; y: number } = { x: 0, y: 0 };
  public w: number = VIEW_W;
  public wordList: string[] = [];

  public text: { [key: string]: Text | null } = {
    score: null,
    turnScore: null
  };

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
    this.initTextScore();
    this.initTextTurnScore();

    // calculate the position where newly played tiles should go
    const entryPoint = this.boardBg.children.at(-1).getBounds();
    this.tileEntryPoint = {
      x: entryPoint.x,
      y: entryPoint.y
    };

    this.listenForTileClick();

    this.ticker.add(this.update.bind(this));
    this.ticker.start();

    this.wordList = JSON.parse(localStorage.getItem('chain-wordlist'));
  }

  public addChild(...children: DisplayObject[]) {
    this.app?.stage.addChild(...children);
  }

  public checkForWord() {
    const board = this.board.map((tile) => tile.letter).join('');

    for (let i = 0; i < this.wordList.length; i++) {
      const word = this.wordList[i];

      if (board.substring(0, word.length) === word) {
        this.scoreWord(word);
        return;
      }
    }

    this.combo = 0;
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

  public initTextScore() {
    this.text.score = new Text('Score: 0', {
      fontFamily: 'Ships Whistle',
      fontSize: 32,
      align: 'left',
      fill: '#09596D'
    });

    this.text.score.x = 20;
    this.text.score.y = 20;

    this.addChild(this.text.score);
  }

  public initTextTurnScore() {
    this.text.turnScore = new Text('', {
      fontFamily: 'Ships Whistle',
      fontSize: 32,
      align: 'left',
      fill: '#ffffff',
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowDistance: 3,
      dropShadowAngle: 90,
      dropShadowBlur: 3,
      dropShadowAlpha: 0.33
    });

    this.text.turnScore.x = this.boardBg.x + SLOT_W * 0.125;
    this.text.turnScore.y = this.boardBg.y - 80;
    this.text.turnScore.alpha = 0;

    this.addChild(this.text.turnScore);
  }

  public listenForTileClick() {
    PubSub.subscribe(TILE_CLICK, (msg: string, tile: Tile) => {
      if (this.preventClicksPromises.length) {
        return;
      }

      const done = this.preventClicksRequest();

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
          boardTile.animationExit();
          return;
        }
        animations.push(boardTile.animationShiftLeft());
      });

      Promise.all(animations.map((a) => a.finished)).then(() => {
        done();
      });

      // add tile to the board
      this.board.push(tile);

      if (this.board.length > 7) {
        this.board.shift();
      }

      if (this.board.length === 7) {
        this.checkForWord();
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

  public preventClicksRequest() {
    let done: Function | undefined;

    const request = new Promise((resolve, reject) => {
      done = resolve;
    });

    request.then(() => {
      this.preventClicksPromises = this.preventClicksPromises.filter(
        (req) => req !== request
      );
    });

    this.preventClicksPromises.push(request);

    return done;
  }

  public scoreWord(word: string) {
    // animate word
    const tiles = this.board.slice(0, word.length);
    const done = this.preventClicksRequest();
    const successAnimations = tiles.map(
      (tile) => tile.animationSuccess().finished
    );
    Promise.all(successAnimations).then(() => done());

    // update score
    let score = (word.length + word.length - 3) * (this.combo + 1);

    if (word.length === 7) {
      score += 7;
    }

    this.score += score;
    this.text.score.text = `Score: ${this.score}`;

    // update/animate turn score
    const comboLabel = this.combo ? `Combo! x ${this.combo}` : '';
    this.text.turnScore.text = `+${score} ${comboLabel}`;

    const startingPosition = this.text.turnScore.y;

    this.text.turnScore.animate({
      targets: {
        alpha: 0
      },
      alpha: 1,
      easing: 'easeInSine',
      endDelay: 1200,
      delay: 300,
      duration: 500,

      complete: (anim) => {
        this.text.turnScore.animate({
          targets: {
            alpha: 1,
            y: startingPosition
          },
          alpha: 0,
          y: '-=10',
          easing: 'easeInSine',
          duration: 300,

          complete: () => {
            this.text.turnScore.y = startingPosition;
          }
        });
      }
    });

    // update combo
    this.combo++;
  }

  public update(dt: number) {}
}
