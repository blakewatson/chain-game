import anime, { AnimeParams } from 'animejs';
import { Text as PixiText, TextStyle } from 'pixi.js';

export default class Text extends PixiText {
  public initialStyle: Partial<TextStyle> = null;

  public constructor(initialText: string, initialStyle?: Partial<TextStyle>) {
    super(initialText);

    const defaultStyle: Partial<TextStyle> = {
      fontFamily: 'Ships Whistle',
      fontSize: 32,
      align: 'center',
      fill: '#09596D'
    };

    this.style = Object.assign({}, defaultStyle, initialStyle || {});
  }

  public animate(options: AnimeParams) {
    const animatedProperties = Object.keys(options.targets);

    return anime({
      ...options,
      update: (anim) => {
        const obj = anim.animatables[0].target as any;

        animatedProperties.forEach((prop) => {
          this[prop] = obj[prop];
        });
      }
    });
  }
}
