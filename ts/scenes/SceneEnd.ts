import anime from 'animejs';
import { Container } from 'pixi.js';
import { VIEW_W } from '../constants';
import Button from '../elements/Button';
import Text from '../elements/Text';
import Game from '../Game';
import { gameStats, IGameStats } from '../stats';
import SceneStatsBase from './SceneStatsBase';

export const gameStatsDisplay = new Map<keyof IGameStats, string>([
  ['score', '✨ Final score'],
  ['numberWords', '🖋 Words made'],
  ['highestTurnScore', '🎉 Highest word score'],
  ['highestComboStreak', '🔥 Longest combo streak'],
  ['avgWordLength', '📏 Average word length']
]);

export default class SceneEnd extends SceneStatsBase {
  public allStatsButton: Button | null = null;
  public buttonGroup: Container | null = null;
  public countdownText: Text | null = null;
  public shareButton: Button | null = null;

  get statsShareText() {
    let txt = Array.from(gameStatsDisplay.entries())
      .map(([key, value]) => {
        let displayValue = gameStats[key];

        if (key === 'avgWordLength' && typeof displayValue === 'number') {
          displayValue = displayValue.toFixed(2);
        }

        return `${value}: ${displayValue}`;
      })
      .join('\n');

    txt = `Chain (${new Date().toDateString()})\n${txt}`;
    return txt;
  }

  public constructor() {
    super();
  }

  public fadeIn() {
    this.visible = true;
    this.allStatsButton.setClickable(true);
    this.shareButton.setClickable(true);

    return anime({
      targets: {
        alpha: this.alpha
      },
      alpha: 1,
      duration: 150,
      easing: 'linear',

      begin: () => {
        this.game.ticker.add(this.updateCountdown, this);
      },

      update: (anim) => {
        const obj = anim.animatables[0].target as any;
        this.alpha = obj.alpha;
      }
    });
  }

  public fadeOut() {
    this.allStatsButton.setClickable(false);
    this.shareButton.setClickable(false);

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
        this.game.ticker.remove(this.updateCountdown.bind(this));
      }
    });
  }

  public init(game: Game) {
    super.init(game);

    this.buttonGroup = new Container();

    this.initAllStatsButton();
    this.initShareButton();
    this.buttonGroup.x = VIEW_W / 2 - this.buttonGroup.width / 2;

    this.initCountdownText();

    this.addChild(this.buttonGroup);
  }

  public initAllStatsButton() {
    this.allStatsButton = new Button({
      game: this.game,
      label: 'All Stats',

      onClick: () => {
        this.fadeOut().finished.then(() => {
          this.game.sceneGlobalStats.showStats();
          this.game.sceneGlobalStats.fadeIn();
        });
      }
    });

    this.buttonGroup.addChild(this.allStatsButton);
  }

  public initCountdownText() {
    this.countdownText = new Text('Next Chain: 00:00:00');
    this.countdownText.x = VIEW_W / 2 - this.countdownText.width / 2;

    this.addChild(this.countdownText);
  }

  public initShareButton() {
    this.shareButton = new Button({
      game: this.game,
      label: 'Share Results',

      onClick: () => {
        navigator.clipboard.writeText(this.statsShareText).then(() => {
          this.shareButton.text.text = 'Copied';

          setTimeout(() => {
            this.shareButton.text.text = 'Share Results';
          }, 1500);
        });
      }
    });

    this.shareButton.x = this.buttonGroup.width + 15;

    this.buttonGroup.addChild(this.shareButton);
  }

  public showStats() {
    super.showStats(gameStatsDisplay, gameStats);
    this.buttonGroup.y = this.stats.children[0].y + this.stats.height + 30;
    this.countdownText.y = this.buttonGroup.y + this.buttonGroup.height + 30;
  }

  public updateCountdown(dt: number) {
    const midnight = new Date();
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    const timeRemaining = midnight.getTime() - Date.now();

    const hours = Math.floor(timeRemaining / 1000 / 60 / 60);
    const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
    const seconds = Math.floor((timeRemaining / 1000) % 60);

    if (hours < 0) {
      this.game.ticker.remove(this.updateCountdown, this);
      this.fadeOut().finished.then(() => this.game.initGame());
      return;
    }

    this.countdownText.text = `Next Chain: ${hours
      .toString()
      .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
