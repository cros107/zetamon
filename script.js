import { Quiz, PracticeQuiz, TimedQuiz } from "./quiz.js";
import { toTuple, fromTuple, shuffle, arrayEqual } from "./helpers.js";
import { PlayerStats } from "./playerStats.js";
import {
  loadHighScore,
  resetHighScore,
  saveHighScore,
  HighScoreCategory,
} from "./highScoreHelper.js";
import { getEffectiveness, typesOrder } from "./typeData.js";
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

let globalState = {
  playing: false, //if false show start game screen, if true show quiz
  playerStats: new PlayerStats(),
  bag: [],
  highScore: {
    single: loadHighScore("40s-single-best"),
    dual: loadHighScore("40s-dual-best"),
    both: loadHighScore("40s-both-best"),
  },
  defendingTypesArray: [1],
  countdownInterval: null,
};

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

function defendingTypeArrayToKey(defendingTypesArray) {
  if (arrayEqual(defendingTypesArray, [1])) return "single";
  if (arrayEqual(defendingTypesArray, [2])) return "dual";
  if (arrayEqual(defendingTypesArray, [1, 2])) return "both";
  throw new Error("Invalid defendingTypesArray");
}

const quizView = {
  quiz: document.getElementById("quiz"),
  attackingImage: document.getElementById("attacking-image"),
  defendingImages: document.getElementById("defending-images"),
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

let quiz = new Quiz(quizView, globalState.defendingTypesArray);


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
  globalView.defendingTypeButtons[
    defendingTypeArrayToKey(globalState.defendingTypesArray)
  ].classList.add("pure-button-active");
}


function startTimedQuiz(timer) {
  // reset quiz state
  quiz = new TimedQuiz(quizView, globalState.defendingTypesArray, timer, endQuiz);
  window.quiz = quiz;

  globalState.playing = "true";
  renderHome(quiz);
  startTimer(quiz);
  
  quiz.nextQuiz();
}

function startPracticeQuiz() {
  quiz = new PracticeQuiz(quizView, globalState.defendingTypesArray); 
    window.quiz = quiz;

    globalState.playing = "true";
    renderHome(quiz);

    quiz.nextQuiz();  
}


window.startPracticeQuiz = startPracticeQuiz;
window.startTimedQuiz = startTimedQuiz;

function endQuiz() {
  globalState.playing = false;

  if (quiz.timer !== null) {
    if (quiz.total - quiz.corrects >= 3) {
      showToast("Quiz ended early due to too many incorrect answers", 3000);
    }

    let categoryName = defendingTypeArrayToKey(globalState.defendingTypesArray);
    globalState.highScore[categoryName] = Math.max(
      globalState.highScore[categoryName],
      quiz.corrects
    );
    saveHighScore(
      HighScoreCategory[categoryName],
      globalState.highScore[categoryName]
    );
  }

  renderHome(quiz);
}

window.endQuiz = endQuiz;

function startTimer(quiz) {
  if (quiz.timer === null) {
    throw new Error("Timer is not set in quiz state");
  }
  globalState.countdownInterval = setInterval(() => {
    if (quiz.timer <= 0) {
      clearInterval(globalState.countdownInterval);
      endQuiz();
    } else {
      quiz.timer--;
    }
    quiz.view.timer.textContent = quiz.timer;
  }, 1000);
}

function endTimer() {
  quiz.timer = 0;
  clearInterval(globalState.countdownInterval);
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
  globalState.defendingTypesArray = mode;
  renderHome(quiz);
}

window.setDefenderTypeCount = setDefenderTypeCount;

renderHome(quiz);

// Attach to window from imports
window.resetHighScore = () => {
  resetHighScore();
  globalState.highScore = {
    single: loadHighScore("40s-single-best"),
    dual: loadHighScore("40s-dual-best"),
    both: loadHighScore("40s-both-best"),
  };
  renderHome(quiz);
};

function preloadImages() {
  for (let type of typesOrder) {
    let img = new Image();
    img.src = `type-icons/${type}.png`;
  }
}

preloadImages();