export const FOCUS_CENTER = [0.76, 0.46] as const;
import { lensArtwork } from "./lens-artwork.ts";
export function focusCenter(width: number, height: number) {
  return [
    width / height > 1.4 ? FOCUS_CENTER[0] : 0.53,
    width / height > 1.4 ? FOCUS_CENTER[1] : 0.7,
  ] as const;
}
export const centers = [
  [222.48, 122.98],
  [321.98, 195.3],
  [283.98, 312.24],
  [160.98, 312.24],
  [122.98, 195.3],
];
/** Scroll is spent assembling the lenses before the sticky hero is released. */
export function convergence(
  sectionTop: number,
  _sceneHeight: number,
  viewportHeight: number,
  headerHeight = 0,
) {
  const progress = Math.max(
    0,
    Math.min(
      1,
      (headerHeight - sectionTop) / Math.min(viewportHeight * 0.65, 600),
    ),
  );
  return progress * progress * (3 - 2 * progress);
}
export function lensGeometry(
  width: number,
  height: number,
  progress: number,
  time: number,
) {
  const rest = [
    [0.735, 0.3],
    [0.84, 0.43],
    [0.79, 0.7],
    [0.65, 0.72],
    [0.61, 0.52],
  ];
  const wide = width / height > 1.4;
  const focus = focusCenter(width, height);
  const restRadius = Math.min(width * (wide ? 0.15 : 0.3), height * 0.29);
  const apertureRadius = Math.min(width * 0.25, height * 0.22);
  return lensArtwork.map((art, i) => {
    const drift = 1 - progress;
    const scale = apertureRadius / art.aperture.radius;
    const targetX = width * focus[0] - (art.aperture.x - art.width / 2) * scale;
    const targetY =
      height * focus[1] - (art.aperture.y - art.height / 2) * scale;
    const amplitude = Math.min(width, height) * 0.055;
    return [
      targetX * progress +
        (width * (wide ? rest[i][0] : (rest[i][0] - 0.5) * 2) +
          Math.sin(time * 0.38 + i * 1.7) * amplitude) *
          drift,
      targetY * progress +
        (height * (wide ? rest[i][1] : 0.56 + rest[i][1] * 0.34) +
          Math.cos(time * 0.31 + i * 2.1) * amplitude) *
          drift,
      (art.width / 2) * scale * progress + restRadius * drift,
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
