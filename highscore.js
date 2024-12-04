export const HighScoreCategory = {
  single: "40s-single-best",
  dual: "40s-dual-best",
  both: "40s-both-best",
}

/**
 * 
 * @param {*} mode 
 * @returns 
 */
export function loadHighScore(mode = "40s-single-best") {
  const savedHighScore = localStorage.getItem(mode);
  if (savedHighScore !== null) {
    return parseInt(savedHighScore);
  } else {
    return 0;
  }
}

export function saveHighScore(mode = "40s-single-best", highScore) {
  localStorage.setItem(mode, highScore);
}

export function resetHighScore() {
  Object.values(HighScoreCategory).forEach(localStorage.removeItem);
}

