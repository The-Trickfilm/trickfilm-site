export const REVEAL_DURATION = 1.25;
export const CLARITY_DURATION = 0.6;
export const HERO_DURATION = REVEAL_DURATION + CLARITY_DURATION;
export const PIXEL_CELL = 10;
/** Normalized lattice with two overscan rows/columns for the flowing surface. */
export function pixelGrid(width: number, height: number) {
  const columns = Math.ceil(width / PIXEL_CELL) + 4,
    rows = Math.ceil(height / PIXEL_CELL) + 4;
  const points = new Float32Array(columns * rows * 2);
  let at = 0;
  for (let y = -2; y < rows - 2; y++)
    for (let x = -2; x < columns - 2; x++) {
      points[at++] = (x * PIXEL_CELL + PIXEL_CELL / 2) / width;
      points[at++] = (y * PIXEL_CELL + PIXEL_CELL / 2) / height;
    }
  return points;
}
