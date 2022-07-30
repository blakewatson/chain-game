import { Dict } from '@pixi/utils';
import anime, { AnimeInstance } from 'animejs';
import {
  Application,
  Container,
  DisplayObject,
  Graphics,
  LoaderResource,
  Sprite,
  Ticker,
  utils
} from 'pixi.js';
import PubSub from 'pubsub-js';
import seedrandom from 'seedrandom';
import {
  COLOR_BG,
  COLOR_SLOT,
  INITIAL_TURNS,
  LETTER_SCORES,
  SLOT_H,
  SLOT_W,
  TILE_CLICK,
  TILE_H,
  TILE_W,
  VIEW_H,
  VIEW_W
} from './constants';
import Text from './elements/Text';
import Tile from './elements/Tile';
import Title from './elements/Title';
import TurnScore from './elements/TurnScore';
import SceneEnd from './scenes/SceneEnd';
import SceneGlobalStats from './scenes/SceneGlobalStats';
import SceneMenu from './scenes/SceneMenu';
import {
  gameStats,
  statsComboStreak,
  statsScore,
  statsTurnScore,
  statsWordLength
} from './stats';
import { letterPreGen } from './utils';

interface ITextElements {
  lastWord: Text | null;
  score: Text | null;
  turns: Text | null;
}

export default class Game {
  public animationGameEnter: AnimeInstance | null = null;
  public app: Application | null = null;
  public bank: Container | null = null;
  public board: Tile[] = [];
  public boardBg: Container | null = null;
  public combo = 0;
  public gameElements: Container | null = null;
  public h: number = VIEW_H;
  public helpSlide: Container = new Container();
  public letters: string[] = [];
  public preventClicksPromises: Promise<any>[] = [];
  public resources: Dict<LoaderResource> | null = null;
  public rng: (() => number) | null = null;
  public sceneEnd = new SceneEnd();
  public sceneMenu = new SceneMenu();
  public sceneGlobalStats = new SceneGlobalStats();
  public score = 0;
  public ticker: Ticker | null = null;
  public tileEntryPoint: { x: number; y: number } = { x: 0, y: 0 };
  public title: Title | null = null;
  public turns = INITIAL_TURNS;
  public turnScore: TurnScore | null = null;
  public w: number = VIEW_W;
  public wordList: string[] = [];

  public text: ITextElements = {
    lastWord: null,
    score: null,
    turns: null
  };

  constructor(ticker: Ticker, resources: Dict<LoaderResource>) {
    this.app = new Application({
      width: VIEW_W,
      height: VIEW_H,
      resolution: window.devicePixelRatio || 1,
      backgroundColor: utils.string2hex(COLOR_BG)
    });

    this.ticker = ticker;
    this.resources = resources;

    document.querySelector('#app')?.append(this.app.view);

    this.title = new Title('Chain');
    this.addChild(this.title);

    this.sceneMenu.init(this);
    this.addChild(this.sceneMenu);

    this.sceneEnd.init(this);
    this.addChild(this.sceneEnd);

    this.addChild(this.helpSlide);

    this.sceneGlobalStats.init(this);
    this.addChild(this.sceneGlobalStats);

    this.initGameElements();

    this.listenForTileClick();

    this.ticker.add(this.update.bind(this));
    this.ticker.start();

    this.wordList = JSON.parse(localStorage.getItem('chain-wordlist'));

    // if today's game has already been played, fade in game stats
    if (gameStats.played) {
      this.sceneMenu.alpha = 0; // hide immediately
      this.sceneMenu.setClickable(false); // prevent clicks
      // this.sceneEnd.updateFinalScore(gameStats.score);
      this.title.moveUp();
      this.sceneEnd.fadeIn();
      this.sceneEnd.showStats();
    }
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

  public drawHelpScreen(screen: 1 | 2 = 1) {
    const key = screen === 1 ? 'help_1' : 'help_2';

    const helpImg = new Sprite(this.resources[key].texture);
    helpImg.width = VIEW_W;
    helpImg.height = VIEW_H;
    helpImg.buttonMode = true;
    helpImg.interactive = true;

    this.helpSlide.addChild(helpImg);

    helpImg.addListener('click', () => {
      this.helpSlide.removeChild(helpImg);

      if (screen === 1) {
        this.drawHelpScreen(2);
        return;
      }

      if (!this.sceneMenu.finalScore) {
        this.title.moveDown();
      }

      this.sceneMenu.fadeIn();
    });
  }

  public async endGame() {
    this.gameElements.interactiveChildren = false;

    for (let i = 0; i < this.board.length - 2; i++) {
      await this.checkForWord(i);
    }

    // fade out game elements
    this.animationGameEnter.reverse();
    this.animationGameEnter.play();
    await this.animationGameEnter.finished;
    this.animationGameEnter.reverse();

    // final score stats
    statsScore(this.score);

    // fade in end scene
    this.sceneEnd.showStats();
    this.sceneEnd.fadeIn();
  }

  public getNextLetter() {
    return this.letters.shift();
  }

  public initBank() {
    this.bank = new Container();
    this.letters = letterPreGen(this.rng);

    let letters: string[] = [];

    for (let i = 0; i < 5; i++) {
      letters.push(this.getNextLetter());
    }

    letters.map((letter, i) => {
      const tile = new Tile({
        game: this,
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

  public initGame(animateIn: boolean = true) {
    this.resetGame();

    this.gameElements.interactiveChildren = true;

    if (animateIn) {
      this.gameElements.alpha = 0;
    }

    this.initBoardBg();
    this.initBank();
    this.initTextScore();
    this.initTextTurnScore();
    this.initTextTurns();
    this.initLastWord();

    this.combo = 0;

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

  public initLastWord() {
    this.text.lastWord = new Text('');
    this.text.lastWord.x = this.text.score.x;
    this.text.lastWord.y = this.text.turns.y;
    this.gameElements.addChild(this.text.lastWord);
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
    this.turnScore = new TurnScore(
      this.boardBg.x + SLOT_W * 0.125,
      this.boardBg.y - 50
    );
    this.gameElements.addChild(this.turnScore);
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

      const newTile = new Tile({
        game: this,
        letter: this.getNextLetter(),
        x: currentPosition.x,
        y: currentPosition.y,
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

  public resetGame() {
    this.gameElements.removeChildren();

    this.board = [];

    this.turns = INITIAL_TURNS;
    this.score = 0;

    this.rng = seedrandom(new Date().toDateString());
  }

  public scoreWord(word: string, start: number = 0) {
    return new Promise((resolve, reject) => {
      // animate word
      const tiles = this.board.slice(start, word.length + start);
      // const done = this.preventClicksRequest();
      const successAnimations = tiles.map((tile) => tile.animationSuccess());
      Promise.all(successAnimations).then(() => resolve(true));

      // play a sound
      this.resources.score.sound.play();

      // calculate word score
      let score = word
        .split('')
        .reduce((total, letter) => total + LETTER_SCORES[letter], 0);

      // multiply by length
      score *= word.length;

      // bonuses
      const sevenLetterBonus = word.length === 7 ? score : 0;
      const comboBonus = this.combo > 0 ? score * this.combo : 0;

      score += sevenLetterBonus + comboBonus;

      this.score += score;
      this.text.score.text = `Score: ${this.score}`;

      // update/animate turn score
      this.turnScore.activate(
        score,
        this.combo,
        this.boardBg.x + SLOT_W * 0.125 + start * SLOT_W * 1.125
      );

      // update combo
      this.combo++;

      // update last word scored
      this.text.lastWord.text = word.toUpperCase();

      // word stats
      statsWordLength(word.length);

      // turn score stats
      statsTurnScore(score);

      // combo stats... minus 1 because this.combo represents number of consecutive
      // words and 1 word does not actually constitute a combo
      statsComboStreak(this.combo - 1);
    });
  }

  public update(dt: number) {}
}
