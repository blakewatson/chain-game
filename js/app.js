import { on, qs, qsa } from './utils.js';

let state = {};

main();

function main() {
  getWordList();
  initGame();
}

function initGame() {
  state = {
    board: [null, null, null, null, null, null, null],
    bank: [null, null, null, null, null],
    turn: 0,
    points: 0
  };

  fillBank();
}

function fillBank() {
  const alpha = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const letters = state.bank.map((tile) => {
    if (tile) {
      return tile.dataset.letter;
    }

    const rand = Math.floor(Math.random() * alpha.length);
    return alpha[rand];
  });

  qs('.bank').innerHTML = Sqrl.render(
    `
      {{ @each(it.letters) => letter, idx }}
        <div class="tile" data-letter="{{ letter }}"><span>{{ letter }}</span></div>
      {{ /each }}
    `,
    { letters }
  );

  state.bank = qsa('.bank .tile');
  state.bank.forEach((el) => on(el, 'click', onClickOfBankTile));
}

async function getWordList() {
  try {
    const resp = await fetch('all-words-alpha.txt');
    const data = await resp.text();

    // setup optimized word list(s) for this game

    // only need 3-7 letter words
    const words = data.split('\n').filter((w) => {
      if (!w || w.length < 3 || w.length > 7) {
        return false;
      }

      return true;
    });

    localStorage.setItem('chain-wordlist', JSON.stringify(words));
  } catch (err) {
    console.error(err);
  }
}

function onClickOfBankTile(event) {
  const el = event.target.classList.contains('tile')
    ? event.target
    : event.target.parentElement;
  const lastSlot = qsa('.slot').pop();

  const left = lastSlot.offsetLeft - el.offsetLeft;
  const top = lastSlot.offsetTop - el.offsetTop;

  // animate the tile from the bank to the board
  anime({
    targets: el,
    translateX: left,
    translateY: top,
    duration: 200,
    easing: 'easeInOutCubic',

    complete() {
      state.board.shift();
      state.board.push(el);

      state.bank = state.bank.map((tile) => (tile === el ? null : tile));

      fillBank();

      qs('.board').append(el);
      el.style = '';
      el.style.position = 'absolute';
      el.style.top = `${lastSlot.offsetTop}px`;
      el.style.left = `calc(${lastSlot.offsetLeft}px - 1em)`;
    }
  });

  // animate the tiles on the board to the left
  const slots = qsa('.slot');
  state.board.forEach((tile, idx) => {
    if (!tile || idx === 0) {
      return;
    }

    anime({
      targets: tile,
      translateX: slots[idx - 1].offsetLeft - tile.offsetLeft,
      duration: 200,
      easing: 'easeInOutCubic'
    });
  });

  // if the board is full, animate the left most tile off the board
  if (state.board[0]) {
    const el = state.board[0];

    anime({
      targets: el,
      translateX: '-=6em',
      translateY: {
        value: '+=8em',
        easing: 'easeInBack'
      },
      rotate: '-190deg',
      opacity: 0,
      duration: 500,
      easing: 'easeInOutCubic'
    });
  }
}
