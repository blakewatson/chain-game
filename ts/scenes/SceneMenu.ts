import anime from 'animejs';
import { Container } from 'pixi.js';
import PubSub from 'pubsub-js';
import {
  COLOR_WHITE,
  HELP_CLICK,
  PLAY_CLICK,
  STATS_CLICK,
  VIEW_H,
  VIEW_W
} from '../constants';
import Button from '../elements/Button';
import Text from '../elements/Text';
import Game from '../Game';

export default class SceneMenu extends Container {
  public credits: Text | null = null;
  public finalScore: Text | null = null;
  public game: Game | null = null;
  public helpButton: Button | null = null;
  public playButton: Button | null = null;
  public statsButton: Button | null = null;

  public constructor() {
    super();
  }

  public fadeIn() {
    this.visible = true;
    this.setClickable(true);

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
    this.setClickable(false);

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

  public init(game: Game) {
    this.game = game;

    this.width = VIEW_W;
    this.height = VIEW_H;

    this.initPlayButton();
    this.initHelpButton();
    this.initStatsButton();
    this.initCredits();

    this.listenForHelpClick();
    this.listenForPlayClick();
    this.listenForStatsClick();
  }

  public initCredits() {
    this.credits = new Text('created by Tim and Blake Watson', {
      fill: COLOR_WHITE,
      fontSize: 24,
      dropShadow: true,
      dropShadowAngle: 90,
      dropShadowBlur: 3,
      dropShadowDistance: 3,
      dropShadowColor: '#000000',
      dropShadowAlpha: 0.33
    });

    this.credits.anchor.set(0.5);
    this.credits.x = VIEW_W / 2;
    this.credits.y = VIEW_H - this.credits.height - 20;

    this.addChild(this.credits);
  }

  public initHelpButton() {
    this.helpButton = new Button({
      game: this.game,
      label: 'How to play',
      clickEventName: HELP_CLICK
    });

    this.helpButton.x = VIEW_W / 2 - this.helpButton.width / 2;
    this.helpButton.y = VIEW_H / 2 + this.helpButton.height / 2;

    this.addChild(this.helpButton);
  }

  public initPlayButton() {
    this.playButton = new Button({
      game: this.game,
      label: 'Play',
      clickEventName: PLAY_CLICK
    });

    this.playButton.x = VIEW_W / 2 - this.playButton.width / 2;
    this.playButton.y = VIEW_H / 2 - this.playButton.height;

    this.addChild(this.playButton);
  }

  public initStatsButton() {
    this.statsButton = new Button({
      game: this.game,
      label: 'Stats',
      clickEventName: STATS_CLICK
    });

    this.statsButton.x = VIEW_W / 2 - this.statsButton.width / 2;
    this.statsButton.y = VIEW_H / 2 + this.statsButton.height * 2;

    this.addChild(this.statsButton);
  }

  public listenForHelpClick() {
    PubSub.subscribe(HELP_CLICK, () => {
      // fade out menu buttons and move title
      this.game.title.moveUp();

      this.fadeOut().finished.then(() => {
        this.game.drawHelpScreen();
      });
    });
  }

  public listenForPlayClick() {
    PubSub.subscribe(PLAY_CLICK, () => {
      this.game.initGame();

      this.game.title.moveUp();

      this.fadeOut().finished.then(() => {
        this.playButton.updateLabel('Play Again');
        this.playButton.x = VIEW_W / 2 - this.playButton.width / 2;
      });
    });
  }

  public listenForStatsClick() {
    PubSub.subscribe(STATS_CLICK, () => {
      this.game.title.moveUp();

      this.fadeOut().finished.then(() => {
        // show stats
        this.game.sceneGlobalStats.showStats();
        this.game.sceneGlobalStats.fadeIn();
      });
    });
  }

  public setClickable(clickable: boolean) {
    this.playButton.setClickable(clickable);
    this.helpButton.setClickable(clickable);
    this.statsButton.setClickable(clickable);
  }
}
