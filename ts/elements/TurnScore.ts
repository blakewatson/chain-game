import anime, { AnimeTimelineInstance } from 'animejs';
import { COLOR_TEXT_TURN_SCORE } from '../constants';
import Text from './Text';

export default class TurnScore extends Text {
  public animationTimeline: AnimeTimelineInstance | null = null;
  public startingYPosition = 0;

  public constructor(x: number, y: number) {
    super('', {
      align: 'left',
      fill: COLOR_TEXT_TURN_SCORE,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowDistance: 3,
      dropShadowAngle: 90,
      dropShadowBlur: 3,
      dropShadowAlpha: 0.33
    });

    this.x = x;
    this.y = y;
    this.startingYPosition = y;
    this.alpha = 0;
  }

  public activate(score: number, combo = 0, offset = 0) {
    if (this.animationTimeline) {
      this.animationTimeline.pause();
    }

    const comboLabel = combo ? `Combo! x${combo}` : '';
    this.text = `+${score} ${comboLabel}`;

    this.x = offset;

    this.animationTimeline = anime.timeline();

    this.animationTimeline.add({
      targets: {
        alpha: 0
      },
      alpha: 1,
      easing: 'easeInSine',
      endDelay: 1200,
      delay: 100,
      duration: 150,

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.alpha = obj.alpha;
      }
    });

    this.animationTimeline.add({
      targets: {
        alpha: 1,
        y: this.startingYPosition
      },
      alpha: 0,
      y: '-=10',
      easing: 'easeInSine',
      duration: 300,

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.alpha = obj.alpha;
        this.y = obj.y;
      },

      complete: (anim) => {
        // reset the y position
        this.y = this.startingYPosition;
      }
    });
  }
}
