import { test } from "node:test";
import assert from "node:assert/strict";
import { convergence, lensGeometry, overlapCount } from "../src/lib/lenses.ts";
test("overlap levels count each lens independently", () => {
  const circles = Array.from({ length: 5 }, (_, i) => [i * 20, 0, 95]);
  for (let n = 0; n <= 5; n++) {
    assert.equal(overlapCount(-100 + n * 20, 0, circles), n);
  }
});
test("scroll convergence clamps and reverses", () => {
  assert.equal(convergence(50, 1000), 0);
  assert.equal(convergence(-600, 1000), 1);
  assert.equal(convergence(-300, 1000), 0.5);
  assert.ok(convergence(-400, 1000) > convergence(-200, 1000));
});
test("final geometry has five circles covering central summit and no time drift", () => {
  const a = lensGeometry(960, 500, 1, 0);
  assert.equal(overlapCount(960 * 0.53, 500 * 0.48, a), 5);
  assert.deepEqual(a, lensGeometry(960, 500, 1, 100));
  assert.notDeepEqual(
    lensGeometry(960, 500, 0, 0),
    lensGeometry(960, 500, 0, 100),
  );
});
