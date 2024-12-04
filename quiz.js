import { PokemonTypes, typesOrder } from './typeData.js';

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