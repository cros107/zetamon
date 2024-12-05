import { defaultQuizState } from "./state.js";
import { toTuple, fromTuple, shuffle } from "./helpers.js";
import {
  loadPlayerStats,
  initScoreMap,
  updateScoreMap,
} from "./playerStats.js";
import { loadHighScore, resetHighScore, saveHighScore, HighScoreCategory } from "./highScore.js";
import { getEffectiveness } from "./typeData.js";
import {
  trueRandomSingleType,
  trueRandomDualTypes,
  trueRandomBothTypes,
} from "./quiz.js";
/**
 * import JS types annotation
 *
 * @import {QuizState} from "./state.js";
 */

// Attach to window from imports
window.resetHighScore = () => {
  resetHighScore();
  globalState.highScore = {
    single: loadHighScore("40s-single-best"),
    dual: loadHighScore("40s-dual-best"),
    both: loadHighScore("40s-both-best"),
  };
  renderHome(quizState);
};

let globalState = {
  playing: false, //if false show start game screen, if true show quiz
  playerStats: undefined, //map pairs to their info
  scoreMap: undefined, //map score to pairs with that score
  scores: undefined, //sorted list of possible scores
  bag: [],
  highScore: {
    single: loadHighScore("40s-single-best"),
    dual: loadHighScore("40s-dual-best"),
    both: loadHighScore("40s-both-best"),
  },
  defendingType: "single",
  countdownInterval: null,
};

function initGlobalState() {
  globalState.playerStats = loadPlayerStats();
  globalState.scoreMap = initScoreMap(globalState.playerStats);
  globalState.scores = Object.keys(globalState.scoreMap).map(Number).sort();
}

initGlobalState();

/**
 * @type {QuizState | null}
 */
let quizState = null;

let globalView = {
  finalScore: document.getElementById("final-score"),
  highScore: {
    single: document.getElementById("40s-single-best"),
    dual: document.getElementById("40s-dual-best"),
    both: document.getElementById("40s-both-best"),
  },
  home: document.getElementById("home"),
  defendingTypeButtons: {
    single: document.getElementById("btn-type-single"),
    dual: document.getElementById("btn-type-dual"),
    both: document.getElementById("btn-type-both"),
  },
};

const quizView = {
  quiz: document.getElementById("quiz"),
  attackingImage: document.getElementById("attacking-image"),
  defendingImage: document.getElementById("defending-image"),
  defendingImageDual: document.getElementById("defending-image-dual"),
  buttons: {
    0: document.getElementById("btn-0x"),
    0.25: document.getElementById("btn-0.25x"),
    0.5: document.getElementById("btn-0.5x"),
    1: document.getElementById("btn-1x"),
    2: document.getElementById("btn-2x"),
    4: document.getElementById("btn-4x"),
  },
  result: document.getElementById("result"),
  score: document.getElementById("score"),
  timer: document.getElementById("timer"),
  endQuiz: document.getElementById("end-quiz"),
};

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

function nextQuizRandom() {
  // end quiz if too many incorrect answers in a timed quiz
  if (quizState.timer !== null && quizState.total - quizState.corrects >= 3) {
    if (quizState.timer !== null) {
      endTimer();
      showToast("Quiz ended due to too many incorrect answers", 3000);
    }
    endQuiz();
  }

  let pair = {
    single: trueRandomSingleType,
    dual: trueRandomDualTypes,
    both: trueRandomBothTypes,
  }[globalState.defendingType]();

  quizState.attackingType = pair.attackingType;
  quizState.defendingType = pair.defendingType;
  quizState.effectiveness = getEffectiveness(
    quizState.attackingType,
    quizState.defendingType
  );
  quizState.waiting = false;
  quizState.selectedEffectiveness = null;
  renderQuizState(quizState);
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
    `type-icons/${quizState.attackingType}.png`
  );
  if (quizState.defendingType instanceof Array) {
    quizView.defendingImageDual.hidden = false;
    quizView.defendingImage.setAttribute(
      "src",
      `type-icons/${quizState.defendingType[0]}.png`
    );
    quizView.defendingImageDual.setAttribute(
      "src",
      `type-icons/${quizState.defendingType[1]}.png`
    );
  } else {
    quizView.defendingImageDual.hidden = true;
    quizView.defendingImage.setAttribute(
      "src",
      `type-icons/${quizState.defendingType}.png`
    );
  }
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
  // Hide 0.25x and 4x options on single type defending
  quizView.buttons[0.25].hidden = globalState.defendingType === "single";
  quizView.buttons[4].hidden = globalState.defendingType === "single";

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

/**
 * Render the home screen, and optionally takes in the current quiz state
 * to render the final score
 *
 * @param {QuizState | null} quizState
 */
function renderHome(quizState) {
  globalView.home.hidden = globalState.playing;
  quizView.quiz.hidden = !globalState.playing;

  for (const [mode, highScore] of Object.entries(globalState.highScore)) {
    globalView.highScore[mode].textContent = highScore;
  }

  if (quizState) {
    globalView.finalScore.textContent = `Final score: ${quizState.corrects}/${quizState.total}`;
  }
  globalView.finalScore.hidden = quizState === null;

  for (const [_, button] of Object.entries(globalView.defendingTypeButtons)) {
    button.classList.remove("pure-button-active");
  }
  globalView.defendingTypeButtons[globalState.defendingType].classList.add(
    "pure-button-active"
  );
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
  if (userResponseEffectiveness === quizState.effectiveness) {
    quizState.corrects++;
  }

  //all this is only relevant in practice mode

  // let [atk, def] = [quizState.attackingType, quizState.defendingType]
  // let pair = toTuple(atk, def)
  // if (userResponseEffectiveness === quizState.effectiveness) {
  //   quizState.corrects++;

  //   //update streak of [atk, def]
  //   if (globalState.playerStats.stats[pair].streak < 0) {
  //     globalState.playerStats.stats[pair].streak = 1
  //   }
  //   else globalState.playerStats.stats[pair].streak++
  // }
  // else {
  //   if (globalState.playerStats.stats[pair].streak > 0) {
  //     globalState.playerStats.stats[pair].streak = -1
  //   }
  //   else globalState.playerStats.stats[pair].streak--
  // }
  // //update score of [atk, def]
  // globalState.playerStats.stats[pair].score += globalState.playerStats.stats[pair].streak

  // //we also need to update the groupings of match ups by their score, which is annoying
  // updateScoreMap(pair, globalState.playerStats.stats[pair].score, globalState.playerStats.stats[pair].score - globalState.playerStats.stats[pair].streak)

  quizState.total++;
  quizState.waiting = true;
  // setTimeout(nextQuizScored, 1000);
  setTimeout(nextQuizRandom, 1000);

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

  if (timer !== null) {
    quizState.timer = timer;
    startTimer();
  }

  renderHome(quizState);
  // nextQuizScored();
  nextQuizRandom();
}

window.startQuiz = startQuiz;

function endQuiz() {
  globalState.playing = false;

  if (quizState.timer !== null) {
    globalState.highScore[globalState.defendingType] = Math.max(
      globalState.highScore[globalState.defendingType],
      quizState.corrects
    );
    saveHighScore(
      HighScoreCategory[globalState.defendingType],
      globalState.highScore[globalState.defendingType]
    );
  }

  renderHome(quizState);
}

window.endQuiz = endQuiz;

function startTimer() {
  if (quizState.timer === null) {
    throw new Error("Timer is not set in quiz state");
  }
  globalState.countdownInterval = setInterval(() => {
    if (quizState.timer <= 0) {
      clearInterval(globalState.countdownInterval);
      endQuiz();
    } else {
      quizState.timer--;
    }
    renderTimer(quizState.timer);
  }, 1000);
}

function endTimer() {
  quizState.timer = 0;
  clearInterval(globalState.countdownInterval);
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
    quizView.buttons[0.25].textContent = "rare";
    quizView.buttons[0.5].textContent = "undercooked";
    quizView.buttons[1].textContent = "well done";
    quizView.buttons[2].textContent = "burnt";
    quizView.buttons[4].textContent = "deep fried";
  } else {
    document.getElementById("attack-text").textContent = "attacks";
    quizView.buttons[0].textContent = "0x";
    quizView.buttons[0.25].textContent = "0.25x";
    quizView.buttons[0.5].textContent = "0.5x";
    quizView.buttons[1].textContent = "1x";
    quizView.buttons[2].textContent = "2x";
    quizView.buttons[4].textContent = "4x";
  }
}

updateBrainRotText();

function setDefenderTypeCount(mode) {
  globalState.defendingType = mode;
  renderHome(quizState);
}

window.setDefenderTypeCount = setDefenderTypeCount;

renderHome(quizState);
