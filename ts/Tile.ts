import anime from 'animejs';
import { IPoint } from 'pixi.js';
import Button from './Button';
import {
  COLOR_BUTTON_GRADIENT_BOTTOM,
  COLOR_BUTTON_GRADIENT_TOP,
  COLOR_BUTTON_TEXT,
  COLOR_SUCCESS_GRADIENT_BOTTOM,
  COLOR_SUCCESS_GRADIENT_TOP,
  COLOR_SUCCESS_TEXT,
  SLOT_W,
  TILE_CLICK,
  TILE_H,
  TILE_W
} from './constants';
import { rgbFunctionToHex } from './utils';

export interface ITileOptions {
  letter: string;
  x: number;
  y: number;
  clickable?: boolean;
  animateIn?: boolean;
}

export default class Tile extends Button {
  public animateIn = false;
  public letter = '';

  public constructor(options: ITileOptions) {
    super({
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

    this.letter = options.letter;

    // better alignment for uppercase letter
    this.text.y += 3;

    // animate entrance if necessary
    if (options.animateIn) {
      this.animationEnter();
    }
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
    return anime({
      targets: {
        topColor: COLOR_BUTTON_GRADIENT_TOP,
        bottomColor: COLOR_BUTTON_GRADIENT_BOTTOM,
        textColor: COLOR_BUTTON_TEXT,
        y: this.y
      },
      topColor: COLOR_SUCCESS_GRADIENT_TOP,
      bottomColor: COLOR_SUCCESS_GRADIENT_BOTTOM,
      textColor: COLOR_SUCCESS_TEXT,
      y: '-=50',
      duration: 300,
      endDelay: 500,
      easing: 'easeInOutQuart',
      direction: 'alternate',
      loop: 1,
      update: (anim) => {
        const obj = anim.animatables[0].target as any;

        this.applyBackground(
          rgbFunctionToHex(obj.topColor),
          rgbFunctionToHex(obj.bottomColor)
        );
        this.applyShadow(rgbFunctionToHex(obj.textColor, true));
        this.applyTextStyle(obj.textColor);
        this.y = obj.y;
      }
    });
  }

  public moveToPosition(x: number, y: number) {
    const bounds = this.getBounds();
    const dx = x - bounds.x;
    const dy = y - bounds.y;

    // console.log(bounds.x, bounds.y);
    // console.log(this.x, this.y);
    // console.log(dx, dy);

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
      }
    });
  }
}
