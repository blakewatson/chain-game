import anime, { AnimeInstance } from 'animejs';
import {
  Application,
  Container,
  DisplayObject,
  Graphics,
  Ticker,
  utils
} from 'pixi.js';
import PubSub from 'pubsub-js';
import Button from './Button';
import {
  COLOR_BG,
  COLOR_SLOT,
  COLOR_TEXT_TURN_SCORE,
  COLOR_TITLE,
  INITIAL_TURNS,
  PLAY_CLICK,
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
import { getRandomLetter, letterGenerator } from './utils';

interface ITextElements {
  finalScore: Text | null;
  score: Text | null;
  title: Text | null;
  turns: Text | null;
  turnScore: Text | null;
}

export default class Game {
  public animationGameEnter: AnimeInstance | null = null;
  public app: Application | null = null;
  public bank: Container | null = null;
  public board: Tile[] = [];
  public boardBg: Container | null = null;
  public combo = 0;
  public gameElements: Container | null = null;
  public getNextLetter = letterGenerator();
  public h: number = VIEW_H;
  public lastTime: number = 0;
  public playButton: Button | null = null;
  public preventClicksPromises: Promise<any>[] = [];
  public score = 0;
  public ticker: Ticker | null = null;
  public tileEntryPoint: { x: number; y: number } = { x: 0, y: 0 };
  public turns = INITIAL_TURNS;
  public w: number = VIEW_W;
  public wordList: string[] = [];

  public text: ITextElements = {
    finalScore: null,
    score: null,
    title: null,
    turns: null,
    turnScore: null
  };

  constructor(ticker: Ticker) {
    this.app = new Application({
      width: VIEW_W,
      height: VIEW_H,
      resolution: window.devicePixelRatio || 1,
      backgroundColor: utils.string2hex(COLOR_BG)
    });

    this.ticker = ticker;

    document.querySelector('#app')?.append(this.app.view);

    this.initTitle();
    this.initPlayButton();
    this.initGameElements();

    this.listenForPlayClick();
    this.listenForTileClick();

    this.ticker.add(this.update.bind(this));
    this.ticker.start();

    this.wordList = JSON.parse(localStorage.getItem('chain-wordlist'));
  }

  public addChild(...children: DisplayObject[]) {
    this.app?.stage.addChild(...children);
  }

  public async checkForWord(start = 0) {
    const board = this.board.map((tile) => tile.letter).join('');

    for (let i = 0; i < this.wordList.length; i++) {
      const word = this.wordList[i];

      if (board.substring(start, word.length + start) === word) {
        await this.scoreWord(word, start);
        return;
      }
    }

    this.combo = 0;
  }

  public async endGame() {
    const done = this.preventClicksRequest();

    for (let i = 0; i < this.board.length - 2; i++) {
      await this.checkForWord(i);
    }

    // fade out game elements
    this.animationGameEnter.reverse();
    this.animationGameEnter.play();
    await this.animationGameEnter.finished;
    this.animationGameEnter.reverse();

    // create final score text if needed
    if (!this.text.finalScore) {
      this.text.finalScore = new Text(`Final Score: ${this.score}`, {});
      this.text.finalScore.anchor.set(0.5);
      this.text.finalScore.x = VIEW_W / 2;
      this.text.finalScore.y = VIEW_H / 2 - 90;
      this.text.finalScore.alpha = 0;
      this.addChild(this.text.finalScore);
    } else {
      this.text.finalScore.text = `Final Score: ${this.score}`;
    }

    // fade in end scene
    anime({
      targets: {
        alpha: 0
      },
      alpha: 1,
      duration: 300,
      easing: 'linear',

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.text.finalScore.alpha = obj.alpha;
        this.playButton.alpha = obj.alpha;
      },

      complete: () => {
        this.playButton.setClickable(true);
        done();
      }
    });
  }

  public initBank() {
    this.bank = new Container();

    let letters: string[] = [];

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
        y: 0
      });

      this.bank.addChild(tile);
    });

    this.gameElements.addChild(this.bank);
    this.bank.x = VIEW_W / 2 - this.bank.width / 2;
    this.bank.y = VIEW_H / 2 + TILE_H;
  }

  public initBoardBg() {
    this.boardBg = new Container();

    for (let i = 0; i < 7; i++) {
      const rect = new Graphics();
      rect.beginFill(utils.string2hex(COLOR_SLOT));
      rect.drawRoundedRect(i * SLOT_W * 1.125, 0, SLOT_W, SLOT_H, 16);
      rect.endFill();
      rect.alpha = 0.5;
      this.boardBg.addChild(rect);
    }

    this.gameElements.addChild(this.boardBg);
    this.boardBg.x = VIEW_W / 2 - this.boardBg.width / 2;
    this.boardBg.y = VIEW_H / 2 - TILE_H;
  }

  public initGame(animateIn: boolean = false) {
    if (this.turns === 0) {
      this.resetGame();
    }

    this.initBoardBg();

    if (animateIn) {
      this.gameElements.alpha = 0;
    }

    this.initBank();
    this.initTextScore();
    this.initTextTurnScore();
    this.initTextTurns();

    // calculate the position where newly played tiles should go
    const entryPoint = this.boardBg.children.at(-1).getBounds();
    this.tileEntryPoint = {
      x: entryPoint.x,
      y: entryPoint.y
    };

    if (animateIn) {
      this.animationGameEnter = anime({
        targets: {
          alpha: 0
        },
        alpha: 1,
        duration: 500,
        easing: 'linear',

        update: (anim) => {
          const obj = anim.animatables[0].target as any;
          this.gameElements.alpha = obj.alpha;
        }
      });
    }
  }

  public initGameElements() {
    this.gameElements = new Container();
    this.gameElements.width = this.app.view.width;
    this.gameElements.height = this.app.view.height;
    this.addChild(this.gameElements);
  }

  public initPlayButton() {
    this.playButton = new Button({
      label: 'Play',
      paddingX: 60,
      paddingY: 20,
      clickEventName: PLAY_CLICK
    });

    this.playButton.x = VIEW_W / 2 - this.playButton.width / 2;
    this.playButton.y = VIEW_H / 2 - this.playButton.height / 2;

    this.addChild(this.playButton);
  }

  public initTextScore() {
    this.text.score = new Text('Score: 0', {
      align: 'left'
    });

    this.text.score.x = 20;
    this.text.score.y = 20;

    this.gameElements.addChild(this.text.score);
  }

  public initTextTurns() {
    this.text.turns = new Text(`Turns: ${this.turns}`, {
      align: 'left'
    });

    this.text.turns.x = VIEW_W / 2 - this.text.turns.width / 2;
    this.text.turns.y = VIEW_H - this.text.turns.height - 20;

    this.gameElements.addChild(this.text.turns);
  }

  public initTextTurnScore() {
    this.text.turnScore = new Text('', {
      fontFamily: 'Ships Whistle',
      fontSize: 32,
      align: 'left',
      fill: COLOR_TEXT_TURN_SCORE,
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

    this.gameElements.addChild(this.text.turnScore);
  }

  public initTitle() {
    this.text.title = new Text('Chain', {
      fontFamily: 'Ships Whistle',
      fontSize: 84,
      align: 'center',
      fill: COLOR_TITLE,
      // stroke: '#BAB108',
      // strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowDistance: 3,
      dropShadowAngle: 90,
      dropShadowBlur: 3,
      dropShadowAlpha: 0.33
    });

    this.text.title.x = VIEW_W / 2 - this.text.title.width / 2;
    this.text.title.y = 100;

    this.addChild(this.text.title);
  }

  public listenForPlayClick() {
    PubSub.subscribe(PLAY_CLICK, () => {
      this.playButton.setClickable(false);
      this.initGame(true);

      anime({
        targets: {
          alpha: 1,
          y: this.text.title.y
        },
        alpha: {
          value: 0,
          duration: 150
        },
        y: 50,
        duration: 500,
        easing: 'easeInOutSine',

        update: (anim) => {
          const obj = anim.animatables[0].target as any;
          this.text.title.y = obj.y;
          this.playButton.alpha = obj.alpha;

          if (this.text.finalScore) {
            this.text.finalScore.alpha = obj.alpha;
          }
        },

        complete: (anim) => {
          this.playButton.updateLabel('Play Again');
          this.playButton.x = VIEW_W / 2 - this.playButton.width / 2;
        }
      });
    });
  }

  public listenForTileClick() {
    PubSub.subscribe(TILE_CLICK, async (msg: string, tile: Tile) => {
      if (this.preventClicksPromises.length || !this.turns) {
        return;
      }

      this.turns--;
      this.text.turns.text = `Turns: ${this.turns}`;

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
          boardTile
            .animationExit()
            .then(() => this.bank.removeChild(boardTile));
          return;
        }
        animations.push(boardTile.animationShiftLeft());
      });

      Promise.all(animations.map((a) => a.finished)).then(() => {
        done();

        // add tile to the board
        this.board.push(tile);

        if (this.board.length > 7) {
          this.board.shift();
        }

        if (!this.turns) {
          this.endGame();
          return;
        }

        if (this.board.length === 7) {
          this.checkForWord();
        }
      });

      // generate new letter tile in place of the one that was just played
      // if the end of the game is coming, skip this step
      if (this.turns > 4) {
        const newTile = new Tile({
          letter: this.getNextLetter(),
          x: currentPosition.x,
          y: currentPosition.y,
          animateIn: true
        });

        this.bank.addChild(newTile);
      }
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

  public resetGame() {
    this.gameElements.removeChildren();

    this.board = [];

    this.turns = INITIAL_TURNS;
    this.score = 0;
  }

  public scoreWord(word: string, start: number = 0) {
    return new Promise((resolve, reject) => {
      // animate word
      const tiles = this.board.slice(start, word.length + start);
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
      this.text.turnScore.x =
        this.boardBg.x + SLOT_W * 0.125 + start * SLOT_W * 1.125;

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
              resolve(true);
            }
          });
        }
      });

      // update combo
      this.combo++;
    });
  }

  public update(dt: number) {}
}
