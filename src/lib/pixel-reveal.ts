export const REVEAL_DURATION = 1.25;
/** Stable noise gives the moving reveal edge a fine, irregular silhouette. */
export function tileSeed(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
export function revealDistance(x: number, y: number) {
  const dx = (x - 0.52) / 0.52,
    dy = (y - 0.47) / 0.53;
  return (
    Math.hypot(dx, dy) +
    Math.sin(x * 17 + y * 8) * Math.cos(y * 13 - x * 5) * 0.035
  );
}
export function revealPixel(elapsed: number, distance: number, seed: number) {
  if (elapsed <= 0.1) return 0;
  if (elapsed >= REVEAL_DURATION) return 1;
  const t = Math.max(0, Math.min(1, (elapsed - 0.1) / (REVEAL_DURATION - 0.1)));
  const eased = t * t * (3 - 2 * t);
  const front = (eased * 1.8 - distance) / 0.18;
  if (front >= 1) return 1;
  if (front <= -1) return 0;
  // Only the travelling edge flickers; the image behind it stays resolved.
  const coverage = (front + 1) * 0.5;
  const noise = (seed * 7.13 + Math.floor(elapsed * 18) * 0.61803398875) % 1;
  return noise < coverage ? 1 : 0;
}
