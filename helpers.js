export const toTuple = (atk, def) => atk + " " + def;
export const fromTuple = (atkdef) => atkdef.split(" ");
export function shuffle(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
