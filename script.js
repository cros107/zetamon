import { Quiz, PracticeQuiz, TimedQuiz, TrainingQuiz } from "./quiz.js";
import { arrayEqual, toTuple } from "./helpers.js";
import { PlayerStats } from "./playerStats.js";
import {
  loadHighScore,
  resetHighScore,
  saveHighScore,
  HighScoreCategory,
} from "./highScoreHelper.js";
import { typesOrder } from "./typeData.js";

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
 * @param {Quiz | null} quiz
 */
function renderHome(quiz) {
  globalView.home.hidden = globalState.playing;
  quizView.quiz.hidden = !globalState.playing;

  for (const [mode, highScore] of Object.entries(globalState.highScore)) {
    if (globalView.highScore[mode])
      globalView.highScore[mode].textContent = highScore;
  }

  if (globalView.finalScore)
    globalView.finalScore.textContent = `Final score: ${quiz.corrects}/${quiz.total}`;

  if (globalView.finalScore) globalView.finalScore.hidden = quiz === null;

  for (const [_, button] of Object.entries(globalView.defendingTypeButtons)) {
    if (button) button.classList.remove("pure-button-active");
  }

  if (
    globalView.defendingTypeButtons[
      defendingTypeArrayToKey(globalState.defendingTypesArray)
    ]
  ) {
    globalView.defendingTypeButtons[
      defendingTypeArrayToKey(globalState.defendingTypesArray)
    ].classList.add("pure-button-active");
  }
}

function startTimedQuiz(timer) {
  // reset quiz state
  quiz = new TimedQuiz(
    quizView,
    globalState.defendingTypesArray,
    timer,
    endQuiz
  );
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

function startTrainingQuiz() {
  quiz = new TrainingQuiz(quizView, [1]);
  window.quiz = quiz;

  globalState.playing = "true";
  renderHome(quiz);

  quiz.nextQuiz();
}

window.startPracticeQuiz = startPracticeQuiz;
window.startTimedQuiz = startTimedQuiz;
window.startTrainingQuiz = startTrainingQuiz;

function endQuiz() {
  globalState.playing = false;

  if (quiz.timer !== null) {
    if (quiz.total - quiz.corrects >= 3) {
      showToast("Quiz ended early due to too many incorrect answers", 3000);
    }

    endTimer();

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
  if (globalState.countdownInterval !== null) {
    throw new Error("Countdown interval already set");
  }
  quiz.view.timer.textContent = quiz.timer;
  globalState.countdownInterval = setInterval(() => {
    if (quiz.timer <= 0) {
      clearInterval(globalState.countdownInterval);
      globalState.countdownInterval = null;
      endQuiz();
    } else {
      quiz.timer--;
    }
    quiz.view.timer.textContent = quiz.timer;
  }, 1000);
}

function endTimer() {
  quiz.timer = 0;
  if (globalState.countdownInterval === null) return;
  clearInterval(globalState.countdownInterval);
  globalState.countdownInterval = null;
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

import { fromTuple, sampleGradient } from "./helpers.js";
function gridData() {
  const gradient = [
    { t: 0, color: { r: 255, g: 132, b: 108 } },
    { t: 0.38, color: { r: 255, g: 220, b: 60 } },
    { t: 1.0, color: { r: 143, g: 255, b: 165 } },
  ];

  let arr = Array.from({ length: 18 }, (_, i) =>
    Array.from({ length: 18 }, (_, j) => ({ i: i, j: j }))
  );
  console.log(arr);
  Object.entries(globalState.playerStats.stats).forEach(([key, value]) => {
    let [atk, def] = fromTuple(key);
    let i = typesOrder.indexOf(atk);
    let j = typesOrder.indexOf(def);
    arr[i][j] = value;
    arr[i][j].score = Math.random();
  });
  console.log(arr);
  return "<th width=64px height=64px/>" + 
  typesOrder.map((type) => `<th><img src="type-icons/${type}.png" class="vert"></th>`).join("") +
    arr
    .map(
      (row, i) =>
        "<tr>" + `<td><img src="type-icons/${typesOrder[i]}.png"></td>` + 
      row.map((cell) => `<td style="background-color: rgb(${sampleGradient(gradient, cell.score).r}, ${sampleGradient(gradient, cell.score).g}, ${sampleGradient(gradient, cell.score).b})"
      ></td>`).join("") + "</tr>"
    )
    .join("");
}

function colourClass(score) {
  let res = "matchup-0";
  if (score >= 10) res = "matchup-10";
  if (score >= 30) res = "matchup-30";
  if (score >= 60) res = "matchup-60";
  if (score >= 100) res = "matchup-100";
  return res;
}

let table = document.getElementById("stats-table");
table.innerHTML = gridData();