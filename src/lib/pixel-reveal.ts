/** Stable spatial noise keeps reveal order consistent across frames and resizes. */
export function tileSeed(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
export function tileClarity(elapsed: number, seed: number) {
  const start = seed * 1.35;
  const age = elapsed - start;
  if (age <= 0) return 0;
  // Two quiet steps through intermediate resolution, then a permanent clear state.
  if (age < 0.24) return 0.32;
  if (age < 0.48) return 0.08;
  if (age < 0.78) return 0.68;
  return 1;
}
