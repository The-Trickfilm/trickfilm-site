import { test } from "node:test";
import assert from "node:assert/strict";
import {
  revealPixel,
  revealDistance,
  tileSeed,
  REVEAL_DURATION,
} from "../src/lib/pixel-reveal.ts";
test("a coherent reveal moves from the centre to the perimeter and settles", () => {
  const centre = revealDistance(0.52, 0.47),
    edge = revealDistance(0, 0);
  for (let i = 0; i < 100; i++) {
    const seed = tileSeed(i % 10, Math.floor(i / 10));
    assert.equal(revealPixel(0, centre, seed), 0);
    assert.equal(revealPixel(0.6, centre, seed), 1);
    assert.equal(revealPixel(0.6, edge, seed), 0);
    assert.equal(revealPixel(REVEAL_DURATION, edge, seed), 1);
    assert.equal(revealPixel(100, edge, seed), 1);
  }
});
test("only the moving edge flickers; revealed interior detail remains stable", () => {
  const states = Array.from({ length: 20 }, (_, i) =>
    revealPixel(0.42 + i * 0.01, 0.7, 0.4),
  );
  assert.equal(new Set(states).size, 2);
  for (let i = 0; i < 20; i++)
    assert.equal(revealPixel(0.42 + i * 0.01, 0.1, 0.4), 1);
});
