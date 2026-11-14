export const FOCUS_CENTER = [0.53, 0.52] as const;
import { lensArtwork } from "./lens-artwork.ts";
export const centers = [
  [222.48, 122.98],
  [321.98, 195.3],
  [283.98, 312.24],
  [160.98, 312.24],
  [122.98, 195.3],
];
/** Converge while the scene is centered in the usable viewport, before its exit. */
export function convergence(
  sceneTop: number,
  sceneHeight: number,
  viewportHeight: number,
  headerHeight = 0,
) {
  const startTop = Math.max(
    headerHeight,
    (viewportHeight + headerHeight - sceneHeight) / 2,
  );
  const progress = Math.max(
    0,
    Math.min(1, (startTop - sceneTop) / (sceneHeight * 0.16)),
  );
  return progress * progress * (3 - 2 * progress);
}
export function lensGeometry(
  width: number,
  height: number,
  progress: number,
  time: number,
) {
  const scale = Math.min((width * 0.78) / 445, (height * 0.5) / 435);
  const rest = [
    [0.54, 0.31],
    [0.7, 0.43],
    [0.66, 0.7],
    [0.4, 0.71],
    [0.28, 0.53],
  ];
  return centers.map(([x, y], i) => {
    const drift = 1 - progress;
    const targetX = width * FOCUS_CENTER[0] + (x - 222.48) * scale;
    const targetY = height * FOCUS_CENTER[1] + (y - 217.61) * scale;
    const restRadius = Math.min(width * 0.26, height * 0.28);
    const amplitude = Math.min(width, height) * 0.055;
    return [
      targetX * progress +
        (width * rest[i][0] + Math.sin(time * 0.38 + i * 1.7) * amplitude) *
          drift,
      targetY * progress +
        (height * rest[i][1] + Math.cos(time * 0.31 + i * 2.1) * amplitude) *
          drift,
      122.98 * scale * progress + restRadius * drift,
    ];
  });
}
export function overlapCount(x: number, y: number, circles: number[][]) {
  return circles.filter(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r)
    .length;
}

/** Map the artwork's inset, offset openings with the same transforms as its paths. */
export function lensApertures(outlines: number[][]) {
  return outlines.map(([x, y, radius], i) => {
    const art = lensArtwork[i];
    const scale = radius / (art.width / 2);
    return [
      x + (art.aperture.x - art.width / 2) * scale,
      y + (art.aperture.y - art.height / 2) * scale,
      art.aperture.radius * scale,
    ];
  });
}
