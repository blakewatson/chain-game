import anime from 'animejs';
import { VIEW_H, VIEW_W } from '../constants';
import Button from '../elements/Button';
import Game from '../Game';
import { gameStats, globalStats, IGlobalStats } from '../stats';
import SceneStatsBase from './SceneStatsBase';

export const globalStatsDisplay = new Map<keyof IGlobalStats, string>([
  ['numberPlayed', 'Games played'],
  ['highScore', 'High score'],
  ['avgScore', 'Average score'],
  ['highestTurnScore', 'Highest word score'],
  ['highestComboStreak', 'Longest combo streak'],
  ['numberWords', 'Words made'],
  ['avgWordLength', 'Average word length']
]);

export default class SceneStats extends SceneStatsBase {
  public doneButton: Button | null = null;

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
    this.visible = true;
    this.doneButton.setClickable(true);

    return anime({
      targets: {
        alpha: this.alpha
      },
      alpha: 1,
      duration: 150,
      easing: 'linear',

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.alpha = obj.alpha;
      }
    });
  }

  public fadeOut() {
    this.doneButton.setClickable(false);

    return anime({
      targets: {
        alpha: this.alpha
      },
      alpha: 0,
      duration: 150,
      easing: 'linear',

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.alpha = obj.alpha;
      },

      complete: (anim) => {
        this.visible = false;
      }
    });
  }

  public hideStats() {
    this.fadeOut().finished.then(() => {
      this.stats.removeChildren();

      if (!gameStats.played) {
        this.game.sceneMenu.fadeIn();
        this.game.title.moveDown();
      } else {
        this.game.sceneEnd.fadeIn();
      }
    });
  }

  public showStats() {
    super.showStats(globalStatsDisplay, globalStats);
  }
}
