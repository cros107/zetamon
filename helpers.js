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

export function lerpf(a, b, t) {
  return a + (b - a) * t;
}

export function lerpfRgb(a, b, t) {
  t = max(t, 0);
  t = min(t, 1);
  return [lerpf(a[0], b[0], t), 
          lerpf(a[1], b[1], t), 
          lerpf(a[2], b[2], t)]
}

/**
 * Samples a color from a gradient based on the given t value.
 * @param {Array<{t: number, color: {r: number, g: number, b: number}}>} gradient - The gradient array.
 * @param {number} t - The value to sample (0 to 1).
 * @returns {{r: number, g: number, b: number}} - The interpolated color.
 */
export function sampleGradient(gradient, t) {
  if (t <= gradient[0].t) return gradient[0].color;
  if (t >= gradient[gradient.length - 1].t) return gradient[gradient.length - 1].color;

  for (let i = 0; i < gradient.length - 1; i++) {
    const start = gradient[i];
    const end = gradient[i + 1];

    if (t >= start.t && t <= end.t) {
      const localT = (t - start.t) / (end.t - start.t);
      return {
        r: lerpf(start.color.r, end.color.r, localT),
        g: lerpf(start.color.g, end.color.g, localT),
        b: lerpf(start.color.b, end.color.b, localT)
      };
    }
  }

  throw new Error("Invalid gradient or t value");
}