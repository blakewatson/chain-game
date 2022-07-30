import anime, { AnimeInstance, AnimeParams } from 'animejs';
import { Text as PixiText, TextStyle } from 'pixi.js';
import { COLOR_TEXT } from '../constants';

export default class Text extends PixiText {
  public currentAnimation: AnimeInstance | null = null;
  public initialStyle: Partial<TextStyle> = null;

  public constructor(initialText: string, initialStyle?: Partial<TextStyle>) {
    super(initialText);

    const defaultStyle: Partial<TextStyle> = {
      fontFamily: 'Ships Whistle',
      fontSize: 32,
      align: 'center',
      fill: COLOR_TEXT
    };

    this.style = Object.assign({}, defaultStyle, initialStyle || {});
  }

  public animate(options: AnimeParams) {
    const animatedProperties = Object.keys(options.targets);

    this.currentAnimation = anime({
      ...options,
      update: (anim) => {
        const obj = anim.animatables[0].target as any;

        animatedProperties.forEach((prop) => {
          this[prop] = obj[prop];
        });
      }
    });

    return this.currentAnimation;
  }
}
