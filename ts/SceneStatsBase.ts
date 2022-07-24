import { Container, Graphics, utils } from 'pixi.js';
import { COLOR_TEXT, VIEW_H, VIEW_W } from './constants';
import Game from './Game';
import { IGameStats, IGlobalStats } from './stats';
import Text from './Text';

export default class SceneStatsBase extends Container {
  public game: Game | null = null;
  public stats: Container = new Container();

  public constructor() {
    super();
  }

  public init(game: Game) {
    this.game = game;
    this.alpha = 0;

    this.width = VIEW_W;
    this.height = VIEW_H;

    this.addChild(this.stats);
  }

  public showStats(
    statsDisplay: Map<keyof IGlobalStats | keyof IGameStats, string>,
    stats: IGlobalStats | IGameStats
  ) {
    Array.from(statsDisplay.entries()).forEach(([key, label], idx: number) => {
      const name = new Text(label, {
        align: 'left'
      });

      name.x = 100;
      name.y = 175 + idx * name.height * 1.45;

      let stat: string | number = stats[key];

      if (key === 'avgWordLength' && typeof stat === 'number') {
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

    // this.fadeIn().finished.then(() => {
    //   this.doneButton.interactive = true;
    //   this.doneButton.buttonMode = true;
    // });
  }
}
