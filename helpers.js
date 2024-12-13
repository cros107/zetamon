export const toTuple = (atk, def) => atk + " " + def;
export const fromTuple = (atkdef) => atkdef.split(" ");
export function shuffle(array) {
  let res = array.slice();
  for (let i = res.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export function arrayEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
