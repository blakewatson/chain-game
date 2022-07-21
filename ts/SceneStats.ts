import anime from 'animejs';
import { Container, Graphics, utils } from 'pixi.js';
import Button from './Button';
import { COLOR_TEXT, VIEW_H, VIEW_W } from './constants';
import Game from './Game';
import { IStats, stats } from './stats';
import Text from './Text';

export const statsDisplay = new Map<keyof IStats, string>([
  ['numberPlayed', 'Games played'],
  ['highScore', 'High score'],
  ['avgScore', 'Average score'],
  ['highestTurnScore', 'Highest word score'],
  ['highestComboStreak', 'Longest combo streak'],
  ['numberWords', 'Words made'],
  ['avgWordLength', 'Average word length']
]);

export default class SceneStats extends Container {
  public doneButton: Button | null = null;
  public game: Game | null = null;
  public stats: Container = new Container();

  public constructor() {
    super();
    this.width = VIEW_W;
    this.height = VIEW_W;
  }

  public init(game: Game) {
    this.game = game;
    this.alpha = 0;

    this.doneButton = new Button({
      game: this.game,
      label: 'Done',
      onClick: () => {
        this.hideStats();
      }
    });

    this.doneButton.x = VIEW_W / 2 - this.doneButton.width / 2;
    this.doneButton.y = VIEW_H - this.doneButton.height - 20;

    this.addChild(this.stats);
    this.addChild(this.doneButton);
  }

  public fadeIn() {
    const anim = this.fadeOut(false);
    anim.reverse();
    anim.seek(150);
    anim.play();

    return anim;
  }

  public fadeOut(autoplay = true) {
    return anime({
      targets: {
        alpha: 1
      },
      alpha: 0,
      duration: 150,
      easing: 'linear',
      autoplay,

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.alpha = obj.alpha;
      }
    });
  }

  public hideStats() {
    this.doneButton.interactive = false;
    this.doneButton.buttonMode = false;

    this.fadeOut().finished.then(() => {
      this.stats.removeChildren();
      this.game.sceneMenu.fadeIn();

      if (!this.game.sceneMenu.finalScore) {
        this.game.title.moveDown();
      }
    });
  }

  public showStats() {
    Array.from(statsDisplay.entries()).forEach(([key, label], idx: number) => {
      const name = new Text(label, {
        align: 'left'
      });

      name.x = 100;
      name.y = 175 + idx * name.height * 1.45;

      let stat: string | number = stats[key];

      if (key === 'avgWordLength') {
        stat = stat.toFixed(2);
      }

      if (key === 'avgScore') {
        stat = Math.round(stat as number);
      }

      const value = new Text(`${stat}`, {
        align: 'right'
      });

      value.x = VIEW_W - 100;
      value.y = 175 + idx * value.height * 1.45;
      value.anchor.set(1, 0);

      this.stats.addChild(name);
      this.stats.addChild(value);

      // draw dots
      const dotWidth = 3.5;
      const dotSpacing = 5;
      const distance = value.x - value.width - name.x - name.width;
      const numOfDots = distance / (dotWidth + dotSpacing) - 1;

      const dots = new Container();

      for (let i = 0; i < numOfDots; i++) {
        const dot = new Graphics();
        dot.beginFill(utils.string2hex(COLOR_TEXT));
        dot.drawCircle(i * (dotWidth + dotSpacing), 0, dotWidth / 2);
        dot.endFill();
        dots.addChild(dot);
      }

      dots.x = name.x + name.width + dotSpacing;
      dots.y = name.y + name.height - dots.height - 5; // magic number

      this.stats.addChild(dots);
    });

    this.fadeIn().finished.then(() => {
      this.doneButton.interactive = true;
      this.doneButton.buttonMode = true;
    });
  }
}
