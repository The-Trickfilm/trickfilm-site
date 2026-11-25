import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  projects,
  websiteProjects,
  CONTACT_EMAIL,
  projectFrames,
} from "../src/lib/projects.ts";
import { logoProjects } from "../src/lib/logo-projects.ts";
test("portfolio links and supplied assets are complete", () => {
  assert.equal(websiteProjects.length, 6);
  assert.equal(new Set(projects.map((p) => p.slug)).size, 10);
  for (const p of projects) {
    assert.equal(new URL(p.url, "https://trickfilm.com").protocol, "https:");
    for (const frame of projectFrames(p))
      assert.ok(existsSync(`public${frame.src}`));
  }
  assert.equal(websiteProjects.at(-2)?.slug, "koan-analytics");
  assert.equal(websiteProjects.at(-2)?.tone, "charcoal");
  assert.equal(logoProjects.length, 18);
  assert.ok(
    !logoProjects.some((p) =>
      ["houndz-character", "xdi-application", "tri-mapp"].includes(p.image),
    ),
  );
  assert.ok(logoProjects.some((p) => p.image === "houndz-unleashed"));
  assert.ok(logoProjects.some((p) => p.image === "xdi"));
  for (const p of logoProjects) assert.ok(existsSync(`public${p.src}`));
  assert.equal(CONTACT_EMAIL, "jeremy@trickfilm.com");
});
