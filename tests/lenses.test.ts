import { summitAt } from "../src/lib/summit.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  convergence,
  lensGeometry,
  lensApertures,
  overlapCount,
} from "../src/lib/lenses.ts";
test("overlap levels count each lens independently", () => {
  const circles = Array.from({ length: 5 }, (_, i) => [i * 20, 0, 95]);
  for (let n = 0; n <= 5; n++) {
    assert.equal(overlapCount(-100 + n * 20, 0, circles), n);
  }
});
test("convergence happens while the scene is still visible, and reverses", () => {
  assert.equal(convergence(110, 800, 910, 110), 0);
  assert.equal(convergence(-18, 800, 910, 110), 1);
  assert.equal(convergence(62, 800, 910, 110), 0.5);
  assert.equal(convergence(600, 420, 844, 85), 0);
  assert.equal(convergence(180, 420, 844, 85), 1);
});
test("final geometry has five circles covering central summit and no time drift", () => {
  const a = lensGeometry(960, 500, 1, 0);
  assert.equal(overlapCount(960 * 0.76, 500 * 0.46, lensApertures(a)), 5);
  assert.deepEqual(a, lensGeometry(960, 500, 1, 100));
  assert.notDeepEqual(
    lensGeometry(960, 500, 0, 0),
    lensGeometry(960, 500, 0, 100),
  );
});

test("each floating lens moves visibly over time without scrolling", () => {
  const a = lensGeometry(900, 830, 0, 0),
    b = lensGeometry(900, 830, 0, 2);
  assert.ok(Math.abs(a[0][0] - b[0][0]) > 20);
  assert.notEqual(a[1][0] - b[1][0], a[2][0] - b[2][0]);
});

test("summit calibration follows the measured apex through the clip", () => {
  assert.deepEqual(summitAt(0), [928 / 1920, 189 / 1080]);
  assert.deepEqual(summitAt(18), [830 / 1920, 147 / 1080]);
  assert.deepEqual(summitAt(0.5), [924.5 / 1920, 188 / 1080]);
  assert.deepEqual(summitAt(100), summitAt(18));
});

test("all five clear apertures coincide completely at the final scroll state", () => {
  const holes = lensApertures(lensGeometry(1672, 831, 1, 4));
  for (const hole of holes) {
    for (let i = 0; i < 3; i++)
      assert.ok(Math.abs(hole[i] - holes[0][i]) < 1e-6);
  }
  assert.equal(
    overlapCount(holes[0][0] + holes[0][2] * 0.9, holes[0][1], holes),
    5,
  );
});
