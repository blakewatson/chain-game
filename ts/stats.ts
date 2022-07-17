export interface IStats {
  avgScore: number;
  avgWordLength: number;
  highestComboStreak: number;
  highestTurnScore: number;
  highScore: number;
  numberPlayed: number;
  numberWords: number;
}

export let stats: IStats = {
  avgScore: 0,
  avgWordLength: 0,
  highestComboStreak: 0,
  highestTurnScore: 0,
  highScore: 0,
  numberPlayed: 0,
  numberWords: 0
};

export const loadStats = () => {
  const data = localStorage.getItem('chain-stats');

  if (!data) {
    return;
  }

  stats = JSON.parse(data);
};

export const saveStats = () => {
  localStorage.setItem('chain-stats', JSON.stringify(stats));
};

export const handleWordLength = (wordLength: number) => {
  stats.avgWordLength =
    (stats.avgWordLength * stats.numberWords + wordLength) /
    (stats.numberWords + 1);

  stats.numberWords++;
};

export const handleComboStreak = (combos: number) => {
  stats.highestComboStreak = Math.max(stats.highestComboStreak, combos);
};

export const handleScore = (score) => {
  stats.avgScore =
    (stats.avgScore * stats.numberPlayed + score) / (stats.numberPlayed + 1);

  stats.numberPlayed++;
  stats.highScore = Math.max(stats.highScore, score);

  saveStats();
};

export const handleTurnScore = (score) => {
  stats.highestTurnScore = Math.max(stats.highestTurnScore, score);
};
