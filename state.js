import { PokemonTypes } from "./typeData.js";

/**
 * @typedef {Object} QuizState
 * @property {PokemonTypes | null} attackingType
 * @property {[PokemonTypes, PokemonTypes] | PokemonTypes | null} defendingType
 * @property {number | null} effectiveness
 * @property {number | null} selectedEffectiveness
 * @property {number} corrects
 * @property {number} total
 * @property {boolean} waiting
 * @property {number | null} timer
 */

/**
 * Default state of a timed quiz
 * @type {QuizState}
 */
export const defaultQuizState = {
  attackingType: null,
  defendingType: null,
  effectiveness: null,
  selectedEffectiveness: null,
  corrects: 0,
  total: 0,
  waiting: false,
  timer: null,
};
