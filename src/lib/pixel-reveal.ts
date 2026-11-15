/** Stable spatial noise keeps reveal order consistent across frames and resizes. */
export function tileSeed(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
export function tileClarity(elapsed: number, seed: number) {
  const start = seed * 1.35;
  const age = elapsed - start;
  if (age <= 0) return 0;
  // Binary visibility: fine, full-resolution squares blink once, then stay sharp.
  if (age < 0.18) return 1;
  if (age < 0.36) return 0;
  return 1;
}
