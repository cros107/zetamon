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

let globalState = {
  playing: false, //if false show start game screen, if true show quiz
};

let globalView = {
  startButton: document.getElementById("startButton"),
};

let quizState = {
  attackingType: null,
  defendingType: null,
  effectiveness: null,
  corrects: 0,
  total: 0,
  waiting: false,
};

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

function nextQuiz() {
  ({
    attackingType: quizState.attackingType,
    defendingType: quizState.defendingType,
  } = weightedRandomTypes());
  quizState.effectiveness = getEffectiveness(
    quizState.attackingType,
    quizState.defendingType
  );
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
  setTimeout(nextQuiz, 1000);
}

function startGame() {
  globalState.playing = "true";
  globalView.startButton.style.display = "none";
  quizView.quiz.style.display = "flex";
  nextQuiz();
}

function endGame() {
  globalState.playing = "false";
  globalView.startButton.style.display = "flex";
  quizView.quiz.style.display = "none";

  //can handle highscores and stuff in here etc
}
