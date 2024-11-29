import { effectivenessMatrix } from "./typeData.js";

/**
 * A list of match ups with effectiveness values of 0, 0.5, 1, and 2.
 * The match ups are indices in the order specified in typeData.js.
 * 
 * @type {Object.<number, ReadonlyArray<[number, number]>>}
 */
export const matchupList = (() => {
  let matchUps = { 0: [], 0.5: [], 1: [], 2: [] };
  for (let i = 0; i < 18; i++) {
    for (let j = 0; j < 18; j++) {
      let effectiveness = effectivenessMatrix[i][j];
      matchUps[effectiveness].push([i, j]);
    }
  }
  return matchUps;
})();

export const excludeList = matchupList[0].concat(
  matchupList[0.5],
  matchupList[2]
);
