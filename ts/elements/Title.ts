import anime, { AnimeParams } from 'animejs';
import { COLOR_TITLE, VIEW_W } from '../constants';
import Text from './Text';

export default class Title extends Text {
  public animDefaults: AnimeParams = {
    duration: 300,
    easing: 'easeInOutSine',
    update: (anim) => {
      const obj = anim.animatables[0].target as any;

      if (obj.y) {
        this.y = obj.y;
      }
    }
  };

  public constructor(text: string) {
    super(text, {
      fontSize: 84,
      align: 'center',
      fill: COLOR_TITLE,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowDistance: 3,
      dropShadowAngle: 90,
      dropShadowBlur: 3,
      dropShadowAlpha: 0.33
    });

    this.x = VIEW_W / 2 - this.width / 2;
    this.y = 100;
  }

  public moveDown(animate = true) {
    if (this.y === 100) {
      return;
    }

    if (!animate) {
      this.y = 100;
      return;
    }

    anime({
      targets: {
        y: 50
      },
      y: 100,
      ...this.animDefaults
    });
  }

  public moveUp(animate = true) {
    if (this.y === 50) {
      return;
    }

    if (!animate) {
      this.y = 50;
      return;
    }

    anime({
      targets: {
        y: 100
      },
      y: 50,
      ...this.animDefaults
    });
  }
}
