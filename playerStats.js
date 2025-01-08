import { typesOrder } from "./typeData.js";
import { toTuple, shuffle } from "./helpers.js";

class MatchupStats {
  constructor() {
    this.score = 0; //score for matchup
    this.streak = 0; //streak of correct/incorrect (+/-) for matchup
    this.lastQuestion = -10000; //last time this matchup was seen
  }
}

export class PlayerStats {
  constructor() {
    this.currentQuestion = 0; //number of questions user has answered so far
    this.stats = new Map(); //map from "tuple" of types to MatchupStats object
    /**
     * @type {Map<number, Set<[PokemonTypes, PokemonTypes]>>}
     */
    this.scoreMap = new Map(); //map from score to set of pairs with that score

    const savedStats = localStorage.getItem("playerStats");
    if (savedStats) {
      this.currentQuestion = savedStats.currentQuestion;
      this.stats = savedStats.stats;
    } else {
      for (let atk of typesOrder) {
        for (let def of typesOrder) {
          const pair = toTuple(atk, def);
          this.stats[pair] = new MatchupStats();
        }
      }
    }
    this.initScoreMap()
  }

  initScoreMap() {
    for (let atk of typesOrder) {
      for (let def of typesOrder) {
        const pair = toTuple(atk, def);
        const score = this.stats[pair].score;
        if (!(score in this.scoreMap)) {
          this.scoreMap[score] = new Set();
        }
        this.scoreMap[score].add(pair);
      }
    }
  }

  save() {
    localStorage.setItem("playerStats", JSON.stringify(
      {
        currentQuestion: this.currentQuestion, 
        stats: this.stats
      }
    ));
  }

  win(pair) {
    if (this.stats[pair].streak < 0) {
      this.stats[pair].streak = 1;
    } else {
      this.stats[pair].streak++;
    }
    
    oldScore = this.stats[pair].score;
    newScore = this.stats[pair].score + this.stats[pair].streak;
    this.stats[pair].score = newScore;
    this.updateScoreMap(pair, oldScore, newScore)
  }

  lose(pair) {
    if (this.stats[pair].streak > 0) {
      this.stats[pair].streak = -1;
    } else {
      this.stats[pair].streak--;
    }

    let oldScore = this.stats[pair].score;
    let newScore = this.stats[pair].score + this.stats[pair].streak;
    this.stats[pair].score = newScore;
    this.updateScoreMap(pair, oldScore, newScore)
  }

  updateScoreMap(pair, oldScore, newScore) {
    this.scoreMap[oldScore].remove(pair)
    if (this.scoreMap[oldScore].size() == 0) {
      this.scoreMap.remove(oldScore)
    }
    if (!(newScore in this.scoreMap)) {
      this.scoreMap[newScore] = new Set();
    }
    this.scoreMap[newScore].add(pair);
  }

  getKLowest(k) {
    let scores = this.scoreMap.keys.sort();
    let res = []
    for (let score in scores) {
      res += Array.from(this.scoreMap[score]);
      if (res.length() > k) break;
    }
    return shuffle(res.slice(0, k));
  }
}