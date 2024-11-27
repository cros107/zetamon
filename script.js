const PokemonTypes = Object.freeze({
  NORMAL: "normal",
  FIRE: "fire",
  WATER: "water",
  ELECTRIC: "electric",
  GRASS: "grass",
  ICE: "ice",
  FIGHTING: "fighting",
  POISON: "poison",
  GROUND: "ground",
  FLYING: "flying",
  PSYCHIC: "psychic",
  BUG: "bug",
  ROCK: "rock",
  GHOST: "ghost",
  DRAGON: "dragon",
  DARK: "dark",
  STEEL: "steel",
  FAIRY: "fairy",
});

const typesOrder = [
  PokemonTypes.NORMAL,
  PokemonTypes.FIRE,
  PokemonTypes.WATER,
  PokemonTypes.ELECTRIC,
  PokemonTypes.GRASS,
  PokemonTypes.ICE,
  PokemonTypes.FIGHTING,
  PokemonTypes.POISON,
  PokemonTypes.GROUND,
  PokemonTypes.FLYING,
  PokemonTypes.PSYCHIC,
  PokemonTypes.BUG,
  PokemonTypes.ROCK,
  PokemonTypes.GHOST,
  PokemonTypes.DRAGON,
  PokemonTypes.DARK,
  PokemonTypes.STEEL,
  PokemonTypes.FAIRY,
];

const typeColors = {
  [PokemonTypes.NORMAL]: "#A8A878",
  [PokemonTypes.FIRE]: "#F08030",
  [PokemonTypes.WATER]: "#6890F0",
  [PokemonTypes.ELECTRIC]: "#F8D030",
  [PokemonTypes.GRASS]: "#78C850",
  [PokemonTypes.ICE]: "#98D8D8",
  [PokemonTypes.FIGHTING]: "#C03028",
  [PokemonTypes.POISON]: "#A040A0",
  [PokemonTypes.GROUND]: "#E0C068",
  [PokemonTypes.FLYING]: "#A890F0",
  [PokemonTypes.PSYCHIC]: "#F85888",
  [PokemonTypes.BUG]: "#A8B820",
  [PokemonTypes.ROCK]: "#B8A038",
  [PokemonTypes.GHOST]: "#705898",
  [PokemonTypes.DRAGON]: "#7038F8",
  [PokemonTypes.DARK]: "#705848",
  [PokemonTypes.STEEL]: "#B8B8D0",
  [PokemonTypes.FAIRY]: "#EE99AC",
};

const effectivenessMatrix = [
  // normal, fire,  water, electric, grass, ice,   fighting, poison, ground, flying, psychic, bug,   rock,  ghost, dragon, dark,  steel, fairy
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1, 1, 0.5, 1], // normal
  [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5, 1, 2, 1], // fire
  [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5, 1, 1, 1], // water
  [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5, 1, 1, 1], // electric
  [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5, 1, 0.5, 1], // grass
  [1, 0.5, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 0.5, 1], // ice
  [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1, 2, 2, 0.5], // fighting
  [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 0, 2], // poison
  [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1, 1, 2, 1], // ground
  [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 0.5, 1], // flying
  [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1, 0, 0.5, 1], // psychic
  [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1, 2, 0.5, 0.5], // bug
  [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 0.5, 1], // rock
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 1], // ghost
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0.5, 0], // dragon
  [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 0.5], // dark
  [1, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0.5, 2], // steel
  [1, 0.5, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 1, 2, 2, 0.5, 1], // fairy
];

function extractMatchup(effectiveness) {
  return Array.from(Array(18))
    .flatMap((_, i) => Array.from(Array(18)).map((_, j) => [i, j]))
    .filter(([i, j]) => effectivenessMatrix[i][j] === effectiveness);
}

const matchupList = {
  0: extractMatchup(0),
  0.5: extractMatchup(0.5),
  1: extractMatchup(1),
  2: extractMatchup(2),
};

const excludeList = Array().concat(
  matchupList[0],
  matchupList[0.5],
  matchupList[2]
);

function createPlayerStats() {
  playerStats = {currentQuestion: 0}
  for (let atk of typesOrder) {
    playerStats[atk] = {}
    for (let def of typesOrder) {
      playerStats[atk][def] = {score: 0, streak: 0, lastQuestion: -10000}
    }
  }
  return playerStats
}

function loadPlayerStats() {
  const savedStats = localStorage.getItem('playerStats');
  if (savedStats) {
    return JSON.parse(savedStats);
  } else {
    return createPlayerStats();
  }
}

function savePlayerStats(playerStats) {
  localStorage.setItem('playerStats', JSON.stringify(playerStats));
}

function loadHighScore() {
  const savedHighScore = localStorage.getItem('quizHighScore');
  if (savedHighScore !== null) {
    return parseInt(savedHighScore);
  } else {
    return null;
  }
}

function saveHighScore(highScore) {
  localStorage.setItem('quizHighScore', highScore);
}

function initScoreMap(playerState) {
  scoreMap = {}
  for (let atk of typesOrder) {
    for (let def of typesOrder) {
      score = playerState[atk][def].score
      if (!(score in scoreMap)) {
        scoreMap[score] = []
      }
      scoreMap[score].push([atk, def])
    }
  }
  return scoreMap
}

function initScores() {

}

let globalState = {
  playing: false, //if false show start game screen, if true show quiz
  playerStats: loadPlayerStats(), //map pairs to their info
  scoreMap: initScoreMap(playerStats), //map score to pairs with that score
  scores: Object.keys(scoreMap).map(Number).sort(), //sorted list of possible scores
  bag: [],
  quizHighScore: loadHighScore(),
};

let globalView = {
  finalScore: document.getElementById("final-score"),
  highScore: document.getElementById("high-score"),
  home: document.getElementById("home"),
};

// update high score if necessary
if (globalState.quizHighScore !== null) {
  globalView.highScore.textContent = `High score: ${globalState.quizHighScore}`;
  globalView.highScore.hidden = false;
}


const defaultQuizState = {
  attackingType: null,
  defendingType: null,
  effectiveness: null,
  corrects: 0,
  total: 0,
  waiting: false,
};

let quizState = { ...defaultQuizState };

let quizView = {
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
  nextQuizRender();
}

function shuffle(array) {
  for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

function nextBag() {
  const bagSize = 20
  const questionBuffer = -1
  let bag = []
  for (let score of globalState.scores) {
    for (let pair of globalState.scoreMap[score]) {
      let [atk, def] = pair
      if (globalState.playerStats.currentQuestion - 
          globalState.playerStats[atk][def].lastQuestion > questionBuffer) {
        bag.push(pair)
      }
    }
    if (bag.length >= bagSize) break
  }
  return shuffle(bag);
}

function nextQuizScored() {
  if (globalState.bag.length == 0) {
    globalState.bag = nextBag()
  }
  let [atk, def] = globalState.bag.pop();

  quizState.attackingType = atk
  quizState.defendingType = def
  quizState.effectiveness = getEffectiveness(atk, def);
  quizState.waiting = false;
  nextQuizRender();
}

function nextQuizRender() {
  quizView.attackingImage.setAttribute(
    "src",
    `typeicons/${quizState.attackingType}.png`
  );
  quizView.defendingImage.setAttribute(
    "src",
    `typeicons/${quizState.defendingType}.png`
  );
  quizView.result.textContent = "";
  quizView.score.textContent = `${quizState.corrects}/${quizState.total} correct`;
  for (const [effectiveness, button] of Object.entries(quizView.buttons)) {
    button.classList.remove("correct", "incorrect", "hint");
    button.onclick = () => respond(button, parseFloat(effectiveness));
  }
}

function respond(button, answer) {
  if (quizState.waiting) {
    return;
  }
  if (answer === quizState.effectiveness) {
    quizView.result.textContent = "Correct!";
    quizState.corrects++;
    button.classList.add("correct");
  } else {
    quizView.result.textContent =
      "Incorrect! Answer: " + quizState.effectiveness + "x";
    button.classList.add("incorrect");
    quizView.buttons[quizState.effectiveness].classList.add("hint");
  }
  quizState.total++;
  quizState.waiting = true;
  setTimeout(nextQuizScored, 1000);
}

function startGame() {
  // reset quiz state
  quizState = { ...defaultQuizState };

  globalState.playing = "true";

  globalView.home.hidden = true;
  quizView.quiz.hidden = false;
  nextQuizRandom();
  startCountdown(40.0);
}

function endGame() {
  globalState.playing = "false";
  // globalView.startButton.style.display = "block";
  
  globalView.finalScore.textContent = `Final score: ${quizState.corrects}/${quizState.total}`;
  
  globalState.quizHighScore = Math.max(globalState.quizHighScore, quizState.corrects);
  
  globalView.highScore.textContent = `High score: ${globalState.quizHighScore}`;
  saveHighScore(globalState.quizHighScore);
  
  globalView.home.hidden = false;
  globalView.finalScore.hidden = false;
  globalView.highScore.hidden = false;
  
  quizView.quiz.hidden = true;
}

function resetHighScore() {
  globalState.quizHighScore = null;
  globalView.highScore.hidden = true;
  localStorage.removeItem('quizHighScore');
}

function startCountdown(timer = 30.0) {
  let timeLeft = timer;
  const timerElement = document.getElementById("timer");
  timerElement.textContent = `${timeLeft}`;
  
  const countdownInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      endGame();
    } else {
      timeLeft--;
    }
    timerElement.textContent = `${timeLeft}`;
  }, 1000);
}
