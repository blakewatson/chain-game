import anime from 'animejs';
import { Container } from 'pixi.js';
import PubSub from 'pubsub-js';
import Button from './Button';
import {
  COLOR_WHITE,
  HELP_CLICK,
  PLAY_CLICK,
  VIEW_H,
  VIEW_W
} from './constants';
import Game from './Game';
import Text from './Text';

export default class SceneMenu extends Container {
  public credits: Text | null = null;
  public finalScore: Text | null = null;
  public game: Game | null = null;
  public helpButton: Button | null = null;
  public playButton: Button | null = null;

  public constructor() {
    super();
  }

  public fadeIn() {
    const anim = this.fadeOut(false);
    anim.seek(150);
    anim.reverse();
    anim.play();

    anim.finished.then(() => {
      this.playButton.setClickable(true);
      this.helpButton.setClickable(true);
    });

    return anim;
  }

  public fadeOut(autoplay = true) {
    this.playButton.setClickable(false);
    this.helpButton.setClickable(false);

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

  public init(game: Game) {
    this.game = game;

    this.width = VIEW_W;
    this.height = VIEW_H;

    this.initPlayButton();
    this.initHelpButton();
    this.initCredits();

    this.listenForHelpClick();
    this.listenForPlayClick();
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

  public initFinalScore(score: number) {
    this.finalScore = new Text(`Final Score: ${score}`);
    this.finalScore.anchor.set(0.5);
    this.finalScore.x = VIEW_W / 2;
    this.finalScore.y = VIEW_H / 2 - 90;
    this.addChild(this.finalScore);
  }

  public initHelpButton() {
    this.helpButton = new Button({
      label: 'How to play',
      clickEventName: HELP_CLICK
    });

    this.helpButton.x = VIEW_W / 2 - this.helpButton.width / 2;
    this.helpButton.y = VIEW_H / 2 + this.helpButton.height;

    this.addChild(this.helpButton);
  }

  public initPlayButton() {
    this.playButton = new Button({
      label: 'Play',
      clickEventName: PLAY_CLICK
    });

    this.playButton.x = VIEW_W / 2 - this.playButton.width / 2;
    this.playButton.y = VIEW_H / 2 - this.playButton.height / 2;

    this.addChild(this.playButton);
  }

  public listenForHelpClick() {
    PubSub.subscribe(HELP_CLICK, () => {
      this.playButton.setClickable(false);
      this.helpButton.setClickable(false);

      // fade out menu buttons and move title
      this.game.title.moveUp();

      this.fadeOut().finished.then(() => {
        this.game.drawHelpScreen();
      });
    });
  }

  public listenForPlayClick() {
    PubSub.subscribe(PLAY_CLICK, () => {
      this.playButton.setClickable(false);
      this.helpButton.setClickable(false);
      this.game.initGame(true);

      this.game.title.moveUp();

      this.fadeOut().finished.then(() => {
        this.playButton.updateLabel('Play Again');
        this.playButton.x = VIEW_W / 2 - this.playButton.width / 2;
      });
    });
  }

  public updateFinalScore(score: number) {
    if (!this.finalScore) {
      this.initFinalScore(score);
      return;
    }

    this.finalScore.text = `Final Score: ${score}`;
  }
}
