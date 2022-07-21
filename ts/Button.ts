import { Sound } from '@pixi/sound';
import { Container, Graphics, TextStyle, utils } from 'pixi.js';
import PubSub from 'pubsub-js';
import {
  COLOR_BUTTON_GRADIENT_BOTTOM,
  COLOR_BUTTON_GRADIENT_TOP,
  COLOR_BUTTON_HOVER_GRADIENT_BOTTOM,
  COLOR_BUTTON_HOVER_GRADIENT_TOP,
  COLOR_BUTTON_TEXT,
  SHADOW_Y
} from './constants';
import Game from './Game';
import Text from './Text';
import { linearGradient } from './utils';

interface IButtonOptions {
  label: string;
  game: Game;
  x?: number;
  y?: number;
  fontSize?: number;
  width?: number;
  height?: number;
  paddingX?: number;
  paddingY?: number;
  corner?: number;
  onClick?: Function;
  clickable?: boolean;
  clickEventName?: string;
}

export default class Button extends Container {
  public bg: Graphics | null = null;
  public buttonHeight: number = 0;
  public buttonWidth: number = 0;
  public clickEventName = 'button-click';
  public corner = 12;
  public fontSize = 32;
  public label: string = '';
  public onClick: Function | null = null;
  public paddingX: number = 60;
  public paddingY: number = 20;
  public shadow: Graphics | null = null;
  public sound: Sound | null = null;
  public text: Text | null = null;
  public textStyle: Partial<TextStyle> = {};

  public constructor(options: IButtonOptions) {
    super();

    this.label = options.label;
    this.fontSize = options.fontSize || this.fontSize;
    this.paddingX = options.paddingX ?? this.paddingX;
    this.paddingY = options.paddingY ?? this.paddingY;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.corner = options.corner || this.corner;

    // save the default sound effect
    this.sound = options.game.resources.click.sound;

    // create the label
    this.text = this.getText();
    this.applyTextStyle();

    this.setButtonDimensions(options.width, options.height);

    this.centerText();

    // create button background
    this.bg = new Graphics();
    this.applyBackground();

    // create the shadow
    this.shadow = new Graphics();
    this.applyShadow();

    // add objects to container
    this.addChild(this.shadow);
    this.addChild(this.bg);
    this.addChild(this.text);

    // mouse events
    this.clickEventName = options.clickEventName || this.clickEventName;
    this.onClick = options.onClick || null; // optional onClick callback
    this.setClickable(
      options.clickable === undefined ? true : options.clickable
    );
  }

  public applyShadow(color = utils.string2hex(COLOR_BUTTON_TEXT)) {
    this.shadow.clear();
    this.shadow.lineStyle(1, color);
    this.shadow.beginFill(color);
    this.shadow.drawRoundedRect(
      0,
      SHADOW_Y,
      this.buttonWidth,
      this.buttonHeight,
      this.corner
    );
    this.shadow.endFill();
  }

  public applyTextStyle(color = COLOR_BUTTON_TEXT) {
    this.text.style = {
      fontFamily: 'Ships Whistle',
      fontSize: this.fontSize,
      align: 'center',
      fill: color
    };
  }

  public applyBackground(
    colorOne = COLOR_BUTTON_GRADIENT_TOP,
    colorTwo = COLOR_BUTTON_GRADIENT_BOTTOM,
    lineColor = utils.string2hex(COLOR_BUTTON_TEXT)
  ) {
    this.bg.clear();
    this.bg.lineStyle(1, lineColor);
    this.bg.beginTextureFill({ texture: this.gradient(colorOne, colorTwo) });
    this.bg.drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, 12);
    this.bg.endFill();
  }

  public centerText() {
    this.text.x = this.buttonWidth / 2;
    this.text.y = this.buttonHeight / 2;
  }

  public getText() {
    const text = new Text(this.label);
    text.resolution = window.devicePixelRatio || 1;
    text.anchor.set(0.5);

    return text;
  }

  public gradient(from: string, to: string) {
    return linearGradient({
      width: this.buttonWidth,
      height: this.buttonHeight,
      position: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: this.buttonHeight
      },
      stops: [
        { offset: 0, color: from },
        { offset: 1, color: to }
      ]
    });
  }

  public initListeners() {
    this.addListener('pointerover', () => this.onHover());
    this.addListener('pointerout', () => this.applyBackground());
    this.addListener('click', () => {
      if (this.clickEventName) {
        PubSub.publish(this.clickEventName, this);
      }

      if (this.onClick) {
        this.onClick();
      }

      this.sound.play();
    });
  }

  public onHover() {
    this.applyBackground(
      COLOR_BUTTON_HOVER_GRADIENT_TOP,
      COLOR_BUTTON_HOVER_GRADIENT_BOTTOM
    );
  }

  public setButtonDimensions(width?: number, height?: number) {
    // if no explicit width and height were given, auto-size to text
    if (width) {
      this.buttonWidth = width;
    } else {
      this.buttonWidth = this.text.width + this.paddingX;
    }

    if (height) {
      this.buttonHeight = height;
    } else {
      this.buttonHeight = this.text.height + this.paddingY;
    }
  }

  public setClickable(value: boolean) {
    this.interactive = value;
    this.buttonMode = value;

    if (!value) {
      this.applyBackground();
      this.removeAllListeners('pointerover');
      this.removeAllListeners('pointerout');
      this.removeAllListeners('click');
    } else {
      this.initListeners();
    }
  }

  public updateLabel(text: string) {
    this.label = text;
    this.text.text = text;
    this.setButtonDimensions();
    this.applyBackground();
    this.applyShadow();
    this.centerText();
  }
}
