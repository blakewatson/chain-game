import anime from 'animejs';
import { Container, Graphics, IPoint, Text, Texture } from 'pixi.js';
import PubSub from 'pubsub-js';
import { SLOT_W, TILE_CLICK } from './constants';

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
    this.shadow = this.getShadow();

    // create the letter
    this.text = this.getText();

    // add objects to container
    this.addChild(this.shadow);
    this.addChild(this.bg);
    this.addChild(this.text);

    // animate entrance if necessary
    if (options.animateIn) {
      this.enterAnimation();
    }

    // mouse events
    const self = this;
    this.addListener('pointerover', () => this.onHover());
    this.addListener('pointerout', () => this.applyTileBackground());
    this.addListener('click', () => {
      PubSub.publish(TILE_CLICK, this);
    });
  }

  public applyTileBackground() {
    this.bg.lineStyle(1, 0x736200);
    this.bg.beginTextureFill({ texture: this.gradient('#fff600', '#D1AB00') });
    this.bg.drawRoundedRect(0, 0, TILE_W, TILE_H, 12);
    this.bg.endFill();
  }

  public enterAnimation() {
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

  public exitAnimation() {
    return new Promise((resolve, reject) => {
      this.shiftLeft().finished.then(() => {
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
            value: '+=200',
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
            this.alpha = obj.alpha;
          },

          complete: (anim) => resolve(anim)
        });
      });
    });
  }

  public getShadow() {
    const shadow = new Graphics();
    shadow.lineStyle(1, 0x736200);
    shadow.beginFill(0x736200);
    shadow.drawRoundedRect(0, SHADOW_Y, TILE_W, TILE_H, 12);
    shadow.endFill();
    return shadow;
  }

  public getText() {
    const text = new Text(this.letter.toUpperCase(), {
      fontFamily: 'Ships Whistle',
      fontSize: 60,
      fontWeight: 'bold',
      align: 'center',
      fill: '#8c7800'
    });

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
    this.bg.clear();
    this.bg.lineStyle(1, 0x736200);
    this.bg.beginTextureFill({ texture: this.gradient('#FFFDC2', '#FFDA35') });
    this.bg.drawRoundedRect(0, 0, TILE_W, TILE_H, 12);
    this.bg.endFill();
  }

  public setClickable(value: boolean) {
    this.interactive = value;
    this.buttonMode = value;

    if (!value) {
      this.applyTileBackground();
    }
  }

  public shiftLeft() {
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
}
