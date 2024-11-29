import { effectivenessMatrix, typesOrder, PokemonTypes } from "./typeData.js";
import { matchupList, excludeList } from "./matchup.js";
import { defaultQuizState } from "./state.js";
import { toTuple, fromTuple } from "./helpers.js";

/**
 * import JS types annotation
 * 
 * @import {QuizState} from "./state.js";
 */

/**
 * @typedef {Object} PlayerStats
 * @property {number} currentQuestion
 * @property {Map<string, {score: number, streak: number, lastQuestion: number}>} stats
 */

/**
 * 
 * @returns {PlayerStats} 
 */
function createPlayerStats() {
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

function loadPlayerStats() {
  const savedStats = localStorage.getItem("playerStats");
  if (savedStats) {
    return JSON.parse(savedStats);
  } else {
    return createPlayerStats();
  }
}

function savePlayerStats(playerStats) {
  localStorage.setItem("playerStats", JSON.stringify(playerStats));
}

function loadHighScore() {
  const savedHighScore = localStorage.getItem("quizHighScore");
  if (savedHighScore !== null) {
    return parseInt(savedHighScore);
  } else {
    return null;
  }
}

function saveHighScore(highScore) {
  localStorage.setItem("quizHighScore", highScore);
}

function initScoreMap(playerState) {
  let scoreMap = {};
  for (let atk of typesOrder) {
    for (let def of typesOrder) {
      let pair = toTuple(atk, def)
      const score = playerState.stats[pair].score;
      if (!(score in scoreMap)) {
        scoreMap[score] = new Set();
      }
      scoreMap[score].add(pair);
    }
  }
  return scoreMap;
}

function initScores() {}

let globalState = {
  playing: false, //if false show start game screen, if true show quiz
  playerStats: undefined, //map pairs to their info
  scoreMap: undefined, //map score to pairs with that score
  scores: undefined, //sorted list of possible scores
  bag: [],
  quizHighScore: loadHighScore(),
};

function initGlobalState() {
  globalState.playerStats = loadPlayerStats();
  globalState.scoreMap = initScoreMap(globalState.playerStats);
  globalState.scores = Object.keys(globalState.scoreMap).map(Number).sort();
}

initGlobalState();

let globalView = {
  finalScore: document.getElementById("final-score"),
  highScore: document.getElementById("high-score"),
  home: document.getElementById("home"),
};

// update high score if necessary
if (globalState.quizHighScore !== null) {
  globalView.highScore.textContent = `Timed quiz high score: ${globalState.quizHighScore}`;
  globalView.highScore.hidden = false;
}

/**
 * @type {QuizState}
 */
let quizState = { ...defaultQuizState };

const quizView = {
  quiz: document.getElementById("quiz"),
  attackingImage: document.getElementById("attacking-image"),
  defendingImage: document.getElementById("defending-image"),
  buttons: {
    0: document.getElementById("btn-0x"),
    0.5: document.getElementById("btn-0.5x"),
    1: document.getElementById("btn-1x"),
    2: document.getElementById("btn-2x"),
  },
  result: document.getElementById("result"),
  score: document.getElementById("score"),
  timer: document.getElementById("timer"),
  endQuiz: document.getElementById("end-quiz"),
};

function getEffectiveness(attackingType, defendingType) {
  const attackingIndex = typesOrder.indexOf(attackingType);
  const defendingIndex = typesOrder.indexOf(defendingType);
  return effectivenessMatrix[attackingIndex][defendingIndex];
}

function randomType() {
  return typesOrder[Math.floor(Math.random() * typesOrder.length)];
}

function trueRandomTypes() {
  const attackingType = randomType();
  const defendingType = randomType();
  return { attackingType, defendingType };
}

function weightedRandomTypes(neutralRate = 0.3) {
  let samplingList = Math.random() < neutralRate ? matchupList[1] : excludeList;
  let [attackingIndex, defendingIndex] =
    samplingList[Math.floor(Math.random() * samplingList.length)];
  return {
    attackingType: typesOrder[attackingIndex],
    defendingType: typesOrder[defendingIndex],
  };
}

function nextQuizRandom() {
  let pair = weightedRandomTypes();
  quizState.attackingType = pair.attackingType;
  quizState.defendingType = pair.defendingType;
  quizState.effectiveness = getEffectiveness(
    quizState.attackingType,
    quizState.defendingType
  );
  quizState.waiting = false;
  quizState.selectedEffectiveness = null;
}

function shuffle(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function nextBag() {
  const bagSize = 20;
  const questionBuffer = -1;
  let bag = [];
  for (let score of globalState.scores) {
    for (let pair of globalState.scoreMap[score]) {
      if (
        globalState.playerStats.currentQuestion -
          globalState.playerStats.stats[pair].lastQuestion >
        questionBuffer
      ) {
        bag.push(pair);
      }
    }
    if (bag.length >= bagSize) break;
  }
  return shuffle(bag);
}

function nextQuizScored() {
  if (globalState.bag.length == 0) {
    globalState.bag = nextBag();
  }
  let [atk, def] = fromTuple(globalState.bag.pop());

  quizState.attackingType = atk;
  quizState.defendingType = def;
  quizState.effectiveness = getEffectiveness(atk, def);
  quizState.waiting = false;
  quizState.selectedEffectiveness = null;
  renderQuizState(quizState);
} 

/**
 * 
 * @param {QuizState} quizState 
 */
function renderQuizState(quizState) {
  quizView.attackingImage.setAttribute(
    "src",
    `typeicons/${quizState.attackingType}.png`
  );
  quizView.defendingImage.setAttribute(
    "src",
    `typeicons/${quizState.defendingType}.png`
  );
  quizView.score.textContent = `${quizState.corrects}/${quizState.total} correct`;
  renderQuizButtons(quizState);
  renderTimer(quizState.timer);
  quizView.endQuiz.hidden = quizState.timer !== null;
}

/**
 * Render the buttons based on the current quiz state
 *
 * @param {QuizState} quizState
 */
function renderQuizButtons(quizState) {
  // No effectiveness selected, clear all colors
  if (quizState.selectedEffectiveness === null) {
    for (const [_, button] of Object.entries(quizView.buttons)) {
      button.classList.remove("hint");
      button.classList.remove("correct");
      button.classList.remove("incorrect");
    }
    quizView.result.textContent = "";
    return;
  }

  // correct answer
  if (quizState.selectedEffectiveness === quizState.effectiveness) {
    quizView.buttons[quizState.effectiveness].classList.add("correct");
    quizView.result.textContent = "Correct!";
    return;
  }

  // incorrect answer
  quizView.buttons[quizState.effectiveness].classList.add("hint");
  quizView.buttons[quizState.selectedEffectiveness].classList.add("incorrect");
  quizView.result.textContent = `Incorrect! Answer: ${quizState.effectiveness}x`;
}

function updateScoreMap(pair, oldScore, newScore) {
  //scoreMap[atk][def].remove()
}

/**
 * Respond to user answer, update quiz state and view
 *
 * @param {HTMLButtonElement} button
 * @param {number} userResponseEffectiveness
 */
function respond(userResponseEffectiveness) {
  if (quizState.waiting) {
    return;
  }
  quizState.selectedEffectiveness = userResponseEffectiveness;
  let [atk, def] = [quizState.attackingType, quizState.defendingType]
  let pair = toTuple(atk, def)
  if (userResponseEffectiveness === quizState.effectiveness) {
    quizState.corrects++;
    
    //update streak of [atk, def]
    if (globalState.playerStats.stats[pair].streak < 0) {
      globalState.playerStats.stats[pair].streak = 1
    }
    else globalState.playerStats.stats[pair].streak++
  }
  else {
    if (globalState.playerStats.stats[pair].streak > 0) {
      globalState.playerStats.stats[pair].streak = -1
    }
    else globalState.playerStats.stats[pair].streak--
  }
  //update score of [atk, def]
  globalState.playerStats.stats[pair].score += globalState.playerStats.stats[pair].streak

  //we also need to update the groupings of matchups by their score, which is annoying
  updateScoreMap(pair, globalState.playerStats.stats[pair].score, globalState.playerStats.stats[pair].score - globalState.playerStats.stats[pair].streak)

  quizState.total++;
  quizState.waiting = true;
  setTimeout(nextQuizScored, 1000);

  renderQuizState(quizState);
}
  
window.respond = respond;

/**
 * 
 * @param {null | number} timer : null if no timer, otherwise quiz time in seconds
 */
function startQuiz(timer = null) {
  // reset quiz state
  quizState = { ...defaultQuizState };

  globalState.playing = "true";

  globalView.home.hidden = true;
  quizView.quiz.hidden = false;

  if (timer !== null) {
    quizState.timer = timer;
    startTimer();
  }

  nextQuizScored();
}

window.startQuiz = startQuiz;

function endQuiz() {
  globalState.playing = "false";

  globalView.finalScore.textContent = `Final score: ${quizState.corrects}/${quizState.total}`;

  if (quizState.timer !== null) {
    globalState.quizHighScore = Math.max(
      globalState.quizHighScore,
      quizState.corrects
    );
    globalView.highScore.textContent = `Timed Quiz High score: ${globalState.quizHighScore}`;
    saveHighScore(globalState.quizHighScore);
  }
  
  
  globalView.home.hidden = false;
  globalView.finalScore.hidden = false;
  globalView.highScore.hidden = false;

  quizView.quiz.hidden = true;
}

window.endQuiz = endQuiz;

function resetHighScore() {
  globalState.quizHighScore = null;
  globalView.highScore.hidden = true;
  localStorage.removeItem("quizHighScore");
}

// Attach to window
window.resetHighScore = resetHighScore;

function startTimer() {
  if (quizState.timer === null) {
    throw new Error("Timer is not set in quiz state");
  }
  const countdownInterval = setInterval(() => {
    if (quizState.timer <= 0) {
      clearInterval(countdownInterval);
      endQuiz();
    } else {
      quizState.timer--;
    }
    renderTimer(quizState.timer);
  }, 1000);
}

function renderTimer(timer) {
  if (timer === null) {
    quizView.timer.textContent = "";
    return;
  }
  quizView.timer.textContent = timer;
}

function showToast(message, duration = 1500) {
  // Remove any existing toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.parentNode.removeChild(existingToast);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  const parent = document.getElementById("main-title");
  parent.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

window.showToast = showToast;

function toggleBrainRotText() {
  let message;
  if (localStorage.getItem("brainRotText") === "true") {
    localStorage.removeItem("brainRotText");
    message = "Disabled brain rot";
  } else {
    localStorage.setItem("brainRotText", "true");
    message = "Enabled brain rot";
  }
  showToast(message);
  updateBrainRotText();
}

window.toggleBrainRotText = toggleBrainRotText;

function updateBrainRotText() {
  if (localStorage.getItem("brainRotText") === "true") {
    document.getElementById("attack-text").textContent = "cooks";
    quizView.buttons[0].textContent = "raw";
    quizView.buttons[0.5].textContent = "undercooked";
    quizView.buttons[1].textContent = "well done";
    quizView.buttons[2].textContent = "burnt";
  } else {
    document.getElementById("attack-text").textContent = "attacks";
    quizView.buttons[0].textContent = "0x";
    quizView.buttons[0.5].textContent = "0.5x";
    quizView.buttons[1].textContent = "1x";
    quizView.buttons[2].textContent = "2x";
  }
}

updateBrainRotText();