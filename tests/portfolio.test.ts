import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  projects,
  websiteProjects,
  CONTACT_EMAIL,
} from "../src/lib/projects.ts";
import { logoProjects } from "../src/lib/logo-projects.ts";
test("portfolio links and supplied assets are complete", () => {
  assert.equal(websiteProjects.length, 6);
  assert.equal(new Set(projects.map((p) => p.slug)).size, 7);
  for (const p of projects) {
    assert.equal(new URL(p.url).protocol, "https:");
    assert.ok(existsSync(`public/work/${p.image}.webp`));
  }
  assert.equal(websiteProjects.at(-2)?.slug, "koan-analytics");
  assert.equal(websiteProjects.at(-2)?.tone, "paper");
  assert.equal(logoProjects.length, 18);
  for (const p of logoProjects) assert.ok(existsSync(`public${p.src}`));
  assert.equal(CONTACT_EMAIL, "jeremy@trickfilm.com");
});
