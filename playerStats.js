import { typesOrder } from "./typeData.js";
import { toTuple } from "./helpers.js";

/**
 * @typedef {Object} PlayerStats
 * @property {number} currentQuestion
 * @property {Map<string, {score: number, streak: number, lastQuestion: number}>} stats
 */

/**
 *
 * @returns {PlayerStats}
 */
export function createPlayerStats() {
  /**
   * @type {PlayerStats}
   */
  let playerStats = { currentQuestion: 0 };
  playerStats.stats = new Map();
  for (let atk of typesOrder) {
    for (let def of typesOrder) {
      let pair = toTuple(atk, def);
      playerStats.stats[pair] = { score: 0, streak: 0, lastQuestion: -10000 };
    }
  }
  return playerStats;
}

export function loadPlayerStats() {
  const savedStats = localStorage.getItem("playerStats");
  if (savedStats) {
    return JSON.parse(savedStats);
  } else {
    return createPlayerStats();
  }
}

export function savePlayerStats(playerStats) {
  localStorage.setItem("playerStats", JSON.stringify(playerStats));
}

export function initScoreMap(playerState) {
  let scoreMap = {};
  for (let atk of typesOrder) {
    for (let def of typesOrder) {
      let pair = toTuple(atk, def);
      const score = playerState.stats[pair].score;
      if (!(score in scoreMap)) {
        scoreMap[score] = new Set();
      }
      scoreMap[score].add(pair);
    }
  }
  return scoreMap;
}

export function initScores() {}

export function updateScoreMap(pair, oldScore, newScore) {
  //scoreMap[atk][def].remove()
}
