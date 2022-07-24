export interface IGlobalStats {
  avgNumberWords: number;
  avgScore: number;
  avgWordLength: number;
  highestComboStreak: number;
  highestTurnScore: number;
  highScore: number;
  numberPlayed: number;
  numberWords: number;
}

export interface IGameStats {
  avgWordLength: number;
  date: string;
  highestComboStreak: number;
  highestTurnScore: number;
  numberWords: number;
  played: boolean;
  score: number;
}

export let globalStats: IGlobalStats = {
  avgNumberWords: 0,
  avgScore: 0,
  avgWordLength: 0,
  highestComboStreak: 0,
  highestTurnScore: 0,
  highScore: 0,
  numberPlayed: 0,
  numberWords: 0
};

export let gameStats: IGameStats = {
  avgWordLength: 0,
  date: new Date().toDateString(),
  highestComboStreak: 0,
  highestTurnScore: 0,
  numberWords: 0,
  played: false,
  score: 0
};

export const loadStats = () => {
  const globalData = localStorage.getItem('chain-global-stats');
  const gameData = localStorage.getItem('chain-game-stats');

  if (globalData) {
    globalStats = JSON.parse(globalData);
  }

  if (gameData) {
    const tmp = JSON.parse(gameData);
    gameStats = tmp.date === new Date().toDateString() ? tmp : gameStats;
  }
};

export const saveStats = () => {
  localStorage.setItem('chain-global-stats', JSON.stringify(globalStats));
  localStorage.setItem('chain-game-stats', JSON.stringify(gameStats));
};

export const statsWordLength = (wordLength: number) => {
  globalStats.avgWordLength =
    (globalStats.avgWordLength * globalStats.numberWords + wordLength) /
    (globalStats.numberWords + 1);

  gameStats.avgWordLength =
    (gameStats.avgWordLength * gameStats.numberWords + wordLength) /
    (gameStats.numberWords + 1);

  globalStats.numberWords++;
  gameStats.numberWords++;
};

export const statsComboStreak = (combos: number) => {
  globalStats.highestComboStreak = Math.max(
    globalStats.highestComboStreak,
    combos
  );

  gameStats.highestComboStreak = Math.max(gameStats.highestComboStreak, combos);
};

export const statsScore = (score) => {
  globalStats.avgScore =
    (globalStats.avgScore * globalStats.numberPlayed + score) /
    (globalStats.numberPlayed + 1);

  // calculate average number of words per game
  globalStats.avgNumberWords =
    (globalStats.avgNumberWords * globalStats.numberPlayed +
      gameStats.numberWords) /
    (globalStats.numberPlayed + 1);

  globalStats.numberPlayed++;
  globalStats.highScore = Math.max(globalStats.highScore, score);

  gameStats.score = score;
  gameStats.played = true;

  saveStats();
};

export const statsTurnScore = (score) => {
  globalStats.highestTurnScore = Math.max(globalStats.highestTurnScore, score);
  gameStats.highestTurnScore = Math.max(gameStats.highestTurnScore, score);
};
