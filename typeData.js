export const PokemonTypes = Object.freeze({
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

export const typesOrder = [
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

export const typeColors = {
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

export const effectivenessMatrix = [
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
