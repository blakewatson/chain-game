import anime from 'animejs';
import { Container, Graphics, IPoint, Text, TextStyle, Texture } from 'pixi.js';
import PubSub from 'pubsub-js';
import { SLOT_W, TILE_CLICK } from './constants';
import { rgbFunctionToHex } from './utils';

const SHADOW_Y = 6;
const TILE_W = 60;
const TILE_H = 65 + SHADOW_Y;

export interface ITileOptions {
  letter: string;
  x: number;
  y: number;
  clickable?: boolean;
  animateIn?: boolean;
}

export default class Tile extends Container {
  public animateIn = false;
  public bg: Graphics | null = null;
  public clickable = false;
  public color = '#8c7800';
  public letter = '';
  public shadow: Graphics | null = null;
  public text: Text | null = null;
  public textStyle: Partial<TextStyle> = {};

  public constructor(options: ITileOptions) {
    super();

    this.interactive = options.clickable;
    this.buttonMode = options.clickable;

    this.letter = options.letter;

    this.width = TILE_W;
    this.height = TILE_H;
    this.x = options.x;
    this.y = options.y;

    // create tile background
    this.bg = new Graphics();
    this.applyTileBackground();

    // create the shadow
    this.shadow = new Graphics();
    this.applyShadow();

    // create the letter
    this.text = this.getText();
    this.applyTextStyle();

    // add objects to container
    this.addChild(this.shadow);
    this.addChild(this.bg);
    this.addChild(this.text);

    // animate entrance if necessary
    if (options.animateIn) {
      this.animationEnter();
    }

    // mouse events
    const self = this;
    this.addListener('pointerover', () => this.onHover());
    this.addListener('pointerout', () => this.applyTileBackground());
    this.addListener('click', () => {
      PubSub.publish(TILE_CLICK, this);
    });
  }

  public applyShadow(color = 0x736200) {
    this.shadow.clear();
    this.shadow.lineStyle(1, color);
    this.shadow.beginFill(color);
    this.shadow.drawRoundedRect(0, SHADOW_Y, TILE_W, TILE_H, 12);
    this.shadow.endFill();
  }

  public applyTextStyle(color = '#736200') {
    this.text.style = {
      fontFamily: 'Ships Whistle',
      fontSize: 60,
      fontWeight: 'bold',
      align: 'center',
      fill: color
    };
  }

  public applyTileBackground(
    colorOne = '#fff600',
    colorTwo = '#D1AB00',
    lineColor = 0x736200
  ) {
    this.bg.clear();
    this.bg.lineStyle(1, lineColor);
    this.bg.beginTextureFill({ texture: this.gradient(colorOne, colorTwo) });
    this.bg.drawRoundedRect(0, 0, TILE_W, TILE_H, 12);
    this.bg.endFill();
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
        topColor: '#fff600',
        bottomColor: '#D1AB00',
        textColor: '#736200',
        y: this.y
      },
      topColor: '#38FF38',
      bottomColor: '#139A13',
      textColor: '#073807',
      y: '-=50',
      duration: 300,
      endDelay: 500,
      easing: 'easeInOutQuart',
      direction: 'alternate',
      loop: 1,
      update: (anim) => {
        const obj = anim.animatables[0].target as any;

        this.applyTileBackground(
          rgbFunctionToHex(obj.topColor),
          rgbFunctionToHex(obj.bottomColor)
        );
        this.applyShadow(rgbFunctionToHex(obj.textColor, true));
        this.applyTextStyle(obj.textColor);
        this.y = obj.y;
      }
    });
  }

  public getText() {
    const text = new Text(this.letter.toUpperCase());
    text.resolution = window.devicePixelRatio || 1;
    text.anchor.set(0.5);
    text.x = TILE_W / 2;
    text.y = TILE_H / 2 + 3; // + magic number

    return text;
  }

  public gradient(from: string, to: string) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const grd = ctx.createLinearGradient(TILE_W, 0, TILE_W, TILE_H);
    grd.addColorStop(0, from);
    grd.addColorStop(1, to);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, TILE_W, TILE_H);
    return Texture.from(c);
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

  public onHover() {
    this.applyTileBackground('#FFFDC2', '#FFDA35');
  }

  public setClickable(value: boolean) {
    this.interactive = value;
    this.buttonMode = value;

    if (!value) {
      this.applyTileBackground();
    }
  }
}
