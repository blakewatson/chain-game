import anime from 'animejs';
import { IPoint } from 'pixi.js';
import {
  COLOR_BUTTON_TEXT,
  LETTER_SCORES,
  SLOT_W,
  TILE_CLICK,
  TILE_H,
  TILE_W
} from '../constants';
import Game from '../Game';
import { rgbFunctionToHex } from '../utils';
import Button from './Button';
import Text from './Text';

export interface ITileOptions {
  game: Game;
  letter: string;
  x: number;
  y: number;
  clickable?: boolean;
}

export default class Tile extends Button {
  public animateIn = false;
  public letter = '';
  public lastYPosition = 0;
  public value: Text | null = null;

  public constructor(options: ITileOptions) {
    super({
      game: options.game,
      label: options.letter.toUpperCase(),
      x: options.x,
      y: options.y,
      width: TILE_W,
      height: TILE_H,
      fontSize: 60,
      corner: 12,
      clickable: options.clickable,
      clickEventName: TILE_CLICK
    });

    // override default sound effect
    this.sound = options.game.resources.pop.sound;

    this.lastYPosition = options.y;
    this.letter = options.letter;

    this.createLetterValue();

    // this.bg.tint = 0x38ff38;
    // this.shadow.tint = 0x38ff38;
    // this.text.tint = 0x38ff38;
    // this.value.tint = 0x38ff38;
  }

  public animationEnter() {
    // setup
    this.alpha = 0;
    this.scale.set(0, 0);

    anime({
      targets: {
        alpha: 0,
        scale: 0
      },
      alpha: 100,
      scale: 100,
      delay: 100,
      duration: 400,

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.alpha = 1;
        this.scale.set(obj.scale / 100, obj.scale / 100);
      }
    });
  }

  public animationExit() {
    return new Promise((resolve, reject) => {
      this.animationShiftLeft().finished.then(() => {
        anime({
          targets: {
            x: this.x,
            y: this.y,
            angle: 0,
            alpha: this.alpha
          },
          // x: {
          //   value: '-=100',
          //   easing: 'easeOutSine'
          // },
          y: {
            value: '+=600',
            easing: 'easeInSine'
          },
          angle: -45,
          alpha: 0,
          duration: 300,
          easing: 'easeInSine',

          update: (anim) => {
            const obj = anim.animatables[0].target as any;
            this.x = obj.x;
            this.y = obj.y;
            this.angle = obj.angle;
            //this.alpha = obj.alpha;
          },

          complete: (anim) => resolve(anim)
        });
      });
    });
  }

  public animationShiftLeft() {
    return anime({
      targets: {
        x: this.x
      },
      x: this.x - SLOT_W * 1.125,
      duration: 400,
      update: (anim) => {
        const obj = anim.animatables[0].target as unknown as IPoint;
        this.x = obj.x;
      }
    });
  }

  public animationSuccess() {
    return new Promise((resolve, reject) => {
      anime({
        targets: {
          y: this.lastYPosition
        },
        y: '-=20',
        duration: 500,
        easing: 'easeOutQuart',
        direction: 'alternate',
        loop: 1,

        update: (anim) => {
          const obj = anim.animatables[0].target as any;
          this.y = obj.y;
        },

        complete: (anim) => {
          resolve(true);
        }
      });

      // we'll update the text style once then flip this boolean
      let textStyleChanged = false;

      anime({
        targets: {
          tint: '#ffffff'
        },
        tint: '#38ff38',
        duration: 1000,
        easing: 'linear',
        direction: 'alternate',
        loop: 1,

        update: (anim) => {
          const obj = anim.animatables[0].target as any;

          this.bg.tint = rgbFunctionToHex(obj.tint, true);
          this.shadow.tint = rgbFunctionToHex(obj.tint, true);
          this.text.tint = rgbFunctionToHex(obj.tint, true);
          this.value.tint = rgbFunctionToHex(obj.tint, true);
        }
      });
    });
  }

  public createLetterValue() {
    this.value = new Text(LETTER_SCORES[this.letter].toString(), {
      fontSize: 18,
      fill: COLOR_BUTTON_TEXT
    });

    this.value.x = TILE_W - this.value.width - 6;
    this.value.y = TILE_H - this.value.height;

    this.addChild(this.value);
  }

  public moveToPosition(x: number, y: number) {
    const bounds = this.getBounds();
    const dx = x - bounds.x;
    const dy = y - bounds.y;

    return anime({
      targets: {
        x: this.x,
        y: this.y
      },
      x: dx + this.x,
      y: dy + this.y,
      duration: 400,

      update: (anim) => {
        const obj = anim.animatables[0].target as unknown as IPoint;
        this.x = obj.x;
        this.y = obj.y;
      },

      complete: (anim) => {
        this.lastYPosition = this.y;
      }
    });
  }
}
