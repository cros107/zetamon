import { PokemonTypes, typesOrder, getEffectiveness } from "./typeData.js";
import { arrayEqual, toTuple, fromTuple, shuffle } from "./helpers.js";
import { endQuiz, gridData } from "./script.js";

function randomType() {
  return typesOrder[Math.floor(Math.random() * typesOrder.length)];
}

/**
 *
 * @returns {{attackingType: PokemonTypes, defendingType: PokemonTypes}}
 */
export function trueRandomSingleType() {
  const attackingType = randomType();
  const defendingType = randomType();
  return { attackingType, defendingType };
}

/**
 *
 * @returns {{attackingType: PokemonTypes, defendingType: [PokemonTypes, PokemonTypes]}}
 */
export function trueRandomDualTypes() {
  const defendingType1 = randomType();
  let defendingType2;
  do {
    defendingType2 = randomType();
  } while (defendingType1 === defendingType2);
  const attackingType = randomType();
  return { attackingType, defendingType: [defendingType1, defendingType2] };
}

export function trueRandomBothTypes() {
  return Math.random() < 0.5 ? trueRandomSingleType() : trueRandomDualTypes();
}

/**
 *
 * @param {number} neutralRate
 * @returns {{attackingType: PokemonTypes, defendingType: PokemonTypes}}
 */
export function weightedRandomTypes(neutralRate = 0.3) {
  let samplingList = Math.random() < neutralRate ? matchupList[1] : excludeList;
  let [attackingIndex, defendingIndex] =
    samplingList[Math.floor(Math.random() * samplingList.length)];
  return {
    attackingType: typesOrder[attackingIndex],
    defendingType: typesOrder[defendingIndex],
  };
}

export class Quiz {
  constructor(view, numTypesArray = [1]) {
    this.numTypesArray = numTypesArray;
    this.attackingType = null;
    /**
     * @type {Array<PokemonTypes>}
     */
    this.defendingTypes = null;
    this.selected = null;
    this.corrects = 0;
    this.total = 0;
    this.view = view;
  }

  respond(effectiveness) {
    if (this.selected !== null) {
      return;
    }
    this.selected = effectiveness;
    this.total++;
    if (effectiveness === this.answer()) {
      this.corrects++;
    }
    this.render();
    setTimeout(this.nextQuiz.bind(this), 1000);
  }

  answer() {
    return this.defendingTypes.reduce((acc, type) => {
      return acc * getEffectiveness(this.attackingType, type);
    }, 1);
  }

  nextQuiz() {
    let numTypes =
      this.numTypesArray[Math.floor(Math.random() * this.numTypesArray.length)];
    this.attackingType = randomType();
    this.defendingTypes = shuffle(typesOrder).slice(0, numTypes);
    this.selected = null;
    this.render();
  }

  render() {
    this.view.attackingImage.setAttribute(
      "src",
      `type-icons/${this.attackingType}.png`
    );
    this.view.defendingImages.innerHTML = this.defendingTypes
      .map((type) => `<img src="type-icons/${type}.png" alt="${type}">`)
      .join("");
    this.view.score.textContent = `${this.corrects}/${this.total} correct`;

    // Hide 0.25x and 4x options on single type defending
    this.view.buttons[0.25].hidden = arrayEqual(this.defendingTypes, [1]);
    this.view.buttons[4].hidden = arrayEqual(this.defendingTypes, [1]);

    // No effectiveness selected, clear all colors
    if (this.selected === null) {
      for (const [_, button] of Object.entries(this.view.buttons)) {
        button.classList.remove("hint");
        button.classList.remove("correct");
        button.classList.remove("incorrect");
      }
      this.view.result.textContent = "";
    }
    // correct answer
    else if (this.selected === this.answer()) {
      this.view.buttons[this.selected].classList.add("correct");
      this.view.result.textContent = "Correct!";
    }
    // incorrect answer
    else {
      this.view.buttons[this.answer()].classList.add("hint");
      this.view.buttons[this.selected].classList.add("incorrect");
      this.view.result.textContent = `Incorrect! Answer: ${this.answer()}x`;
    }
  }
}
export class TimedQuiz extends Quiz {
  constructor(view, numTypesArray, timer, endQuizCallback) {
    super(view, numTypesArray);
    this.view.endQuiz.hidden = true;
    this.timer = timer;
    this.endQuizCallback = endQuizCallback;
  }

  nextQuiz() {
    if (this.total - this.corrects >= 3) {
      this.endQuizCallback();
      return;
    }
    super.nextQuiz();
  }
}

export class PracticeQuiz extends Quiz {
  constructor(view, numTypesArray) {
    super(view, numTypesArray);
    this.view.endQuiz.hidden = false;
  }
}

export class TrainingQuiz extends Quiz {
  constructor(view, numTypesArray, playerStats) {
    super(view, numTypesArray);
    this.playerStats = playerStats;
    this.bag = []
  }

  respond(effectiveness) {
    if (this.selected !== null) {
      return;
    }
    this.selected = effectiveness;
    this.total++;
    if (effectiveness === this.answer()) {
      this.corrects++;
      this.playerStats.win(toTuple(this.attackingType, this.defendingTypes[0]));
    } else {
      this.playerStats.lose(toTuple(this.attackingType, this.defendingTypes[0]));
    }

    this.playerStats.save();

    this.render();
    setTimeout(this.nextQuiz.bind(this), 1000);
  }

  //override nextQuiz to include custom bag stuff
  nextQuiz() {
    if (this.bag.length == 0) {
      this.bag = this.playerStats.getKLowest(3);
    }
    const [atk, def] = fromTuple(this.bag.pop());
    this.attackingType = atk
    this.defendingTypes = [def];
    this.selected = null;
    this.render();
  }

  endQuiz() {
    this.playerStats.save();
    document.getElementById("stats-table").innerHTML = gridData();
    endQuiz();
  }
}