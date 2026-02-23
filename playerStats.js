import { typesOrder } from "./typeData.js";
import { toTuple, shuffle } from "./helpers.js";

class MatchupStats {
  constructor() {
    this.score = 0; //score for matchup
    this.streak = 0; //streak of correct/incorrect (+/-) for matchup
    this.lastAnswerCorrect; //was this correctly answered the last time it appeared?
    this.lastQuestion = 0; //last time this matchup was seen
  }
}

export class PlayerStats {
  constructor() {
    this.currentQuestion = 0; //number of questions user has answered so far
    this.stats = new Map(); //map from "tuple" of types to MatchupStats object
    /**
     * @type {Map<number, Set<PokemonTypes>>}
     */
    this.scoreMap = new Map(); //map from score to set of pairs with that score

    const savedStats = JSON.parse(localStorage.getItem("playerStats"));
    if (savedStats) {
      this.currentQuestion = savedStats.currentQuestion;
      this.stats = new Map(savedStats.stats)
    } else {
      for (let atk of typesOrder) {
        for (let def of typesOrder) {
          const pair = toTuple(atk, def);
          this.stats.set(pair,new MatchupStats())
        }
      }
    }
    this.initScoreMap()
  }

  initScoreMap() {
    for (let atk of typesOrder) {
      for (let def of typesOrder) {
        const pair = toTuple(atk, def);
        console.log(this.stats);
        console.log(pair)
        const score = this.stats.get(pair).score;
        if (!this.scoreMap.has(score)) {
          this.scoreMap.set(score, new Set());
        }
        this.scoreMap.get(score).add(pair);
      }
    }
  }

  save() {
    localStorage.setItem("playerStats", JSON.stringify(
      {
        currentQuestion: this.currentQuestion, 
        stats: Array.from(this.stats.entries())
      }
    ));
  }

  win(pair) {
    if (this.stats.get(pair).streak < 0) {
      this.stats.get(pair).streak = 1;
    } else {
      this.stats.get(pair).streak++;
    }
    
    let oldScore = this.stats.get(pair).score;
    let newScore = this.stats.get(pair).score + this.stats.get(pair).streak;
    this.stats.get(pair).score = newScore;
    this.updateScoreMap(pair, oldScore, newScore)
  }

  lose(pair) {
    if (this.stats.get(pair).streak > 0) {
      this.stats.get(pair).streak = -1;
    } else {
      this.stats.get(pair).streak--;
    }

    let oldScore = this.stats.get(pair).score;
    let newScore = this.stats.get(pair).score + this.stats.get(pair).streak;
    this.stats.get(pair).score = newScore;
    this.updateScoreMap(pair, oldScore, newScore)
  }

  updateScoreMap(pair, oldScore, newScore) {
    this.scoreMap.get(oldScore).delete(pair)
    if (this.scoreMap.get(oldScore).size == 0) {
      this.scoreMap.delete(oldScore)
    }
    if (!(this.scoreMap.has(newScore))) {
      this.scoreMap.set(newScore, new Set());
    }
    this.scoreMap.get(newScore).add(pair);
  }

  getKLowest(k) {
    let scores = Array.from(this.scoreMap.keys()).sort();
    let res = []
    for (const score of scores) {
      res = res.concat(shuffle(Array.from(this.scoreMap.get(score))));
      if (res.length > k) break;
    }

    res = shuffle(res.slice(0, k));
    return res;
  }
}