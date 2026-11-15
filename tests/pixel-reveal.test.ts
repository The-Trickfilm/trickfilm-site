import { test } from "node:test";
import assert from "node:assert/strict";
import { pixelGrid, PIXEL_CELL } from "../src/lib/pixel-reveal.ts";
test("the surface lattice retains 10px cells at desktop and mobile sizes", () => {
  for (const [w, h] of [
    [1440, 960],
    [390, 844],
    [1920, 1080],
  ]) {
    const points = pixelGrid(w, h),
      columns = Math.ceil(w / PIXEL_CELL) + 4;
    assert.ok(Math.abs((points[2] - points[0]) * w - 10) < 0.001);
    assert.ok(Math.abs((points[columns * 2 + 1] - points[1]) * h - 10) < 0.001);
    assert.ok(points[0] < 0 && points[points.length - 2] > 1);
  }
});
