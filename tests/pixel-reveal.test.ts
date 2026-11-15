import { test } from "node:test";
import assert from "node:assert/strict";
import { tileClarity, tileSeed } from "../src/lib/pixel-reveal.ts";
test("the reveal is spatially staggered and settles completely without looping", () => {
  const seeds = Array.from({ length: 100 }, (_, i) =>
    tileSeed(i % 10, Math.floor(i / 10)),
  );
  assert.ok(new Set(seeds).size > 95);
  assert.ok(seeds.every((s) => s >= 0 && s < 1));
  assert.ok(seeds.every((s) => tileClarity(0, s) === 0));
  const middle = seeds.map((s) => tileClarity(0.8, s));
  assert.ok(new Set(middle).size === 2);
  assert.ok(
    seeds.every((s) => tileClarity(2.2, s) === 1 && tileClarity(100, s) === 1),
  );
});
