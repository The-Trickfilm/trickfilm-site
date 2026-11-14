export const centers = [
  [222.48, 122.98],
  [321.98, 195.3],
  [283.98, 312.24],
  [160.98, 312.24],
  [122.98, 195.3],
];
export function convergence(top: number, height: number) {
  const progress = Math.max(0, Math.min(1, -top / (height * 0.6)));
  return progress * progress * (3 - 2 * progress);
}
export function lensGeometry(
  width: number,
  height: number,
  progress: number,
  time: number,
) {
  const scale = Math.min((width * 0.78) / 445, (height * 0.86) / 435);
  return centers.map(([x, y], i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const drift = 1 - progress;
    return [
      width * 0.53 +
        (x - 222.48) * scale +
        drift * (Math.cos(a) * 45 + Math.sin(time * 0.25 + i) * 5),
      height * 0.48 +
        (y - 217.61) * scale +
        drift * (Math.sin(a) * 35 + Math.cos(time * 0.2 + i) * 4),
      122.98 * scale,
    ];
  });
}
export function overlapCount(x: number, y: number, circles: number[][]) {
  return circles.filter(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r)
    .length;
}
