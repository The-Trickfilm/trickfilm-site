// Measured summit coordinates in the user-supplied 1920 × 1080 clip, at one-second intervals.
const track = [
  [0, 928, 189],
  [1, 921, 187],
  [2, 915, 184],
  [3, 910, 181],
  [4, 903, 179],
  [5, 897, 175],
  [6, 891, 173],
  [7, 884, 170],
  [8, 880, 170],
  [9, 872, 164],
  [10, 866, 162],
  [11, 860, 158],
  [12, 853, 156],
  [13, 847, 153],
  [14, 841, 150],
  [15, 834, 148],
  [16, 828, 145],
  [17, 829, 145],
  [18, 830, 147],
] as const;
export function summitAt(time: number) {
  const t = Math.max(0, Math.min(track.length - 1, time));
  const i = Math.floor(t);
  const next = track[Math.min(i + 1, track.length - 1)];
  const a = track[i];
  const mix = t - i;
  return [
    (a[1] + (next[1] - a[1]) * mix) / 1920,
    (a[2] + (next[2] - a[2]) * mix) / 1080,
  ];
}
