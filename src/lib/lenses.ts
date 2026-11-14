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
  const scale = Math.min((width * 0.78) / 445, (height * 0.60) / 435);
  const rest = [
    [0.54, 0.31],
    [0.7, 0.43],
    [0.66, 0.7],
    [0.4, 0.71],
    [0.28, 0.53],
  ];
  return centers.map(([x, y], i) => {
    const drift = 1 - progress;
    const targetX = width * 0.53 + (x - 222.48) * scale;
    const targetY = height * 0.31 + (y - 217.61) * scale;
    const restRadius = Math.min(width * 0.29, height * 0.3);
    return [
      targetX * progress +
        (width * rest[i][0] + Math.sin(time * 0.25 + i) * 3) * drift,
      targetY * progress +
        (height * rest[i][1] + Math.cos(time * 0.2 + i) * 3) * drift,
      122.98 * scale * progress + restRadius * drift,
    ];
  });
}
export function overlapCount(x: number, y: number, circles: number[][]) {
  return circles.filter(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r)
    .length;
}
