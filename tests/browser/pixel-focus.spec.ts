import { test, expect } from "@playwright/test";
test("the real image resolves, replay changes pixels, and scrolling leaves immediately", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const scene = page.locator(".pixel-mountain");
  await expect(scene).toHaveAttribute("data-phase", "clear");
  const resolved = await scene
    .locator("canvas")
    .evaluate((el: HTMLCanvasElement) => el.toDataURL());
  await page.screenshot({ path: "/workspace/work/pixel-desktop.png" });
  await page
    .getByRole("button", { name: "Replay image focus animation" })
    .click();
  await expect(scene).toHaveAttribute("data-phase", "resolving");
  const pixelated = await scene
    .locator("canvas")
    .evaluate((el: HTMLCanvasElement) => el.toDataURL());
  expect(pixelated).not.toEqual(resolved);
  await page.screenshot({ path: "/workspace/work/pixel-resolving.png" });
  await expect(scene).toHaveAttribute("data-phase", "clear");
  expect(
    await scene
      .locator("canvas")
      .evaluate((el: HTMLCanvasElement) => el.toDataURL()),
  ).toEqual(resolved);
  const top = (await scene.boundingBox())!.y;
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
  expect((await scene.boundingBox())!.y).toBeCloseTo(top - 200, 0);
  expect(await page.locator(".lens-outlines").count()).toBe(0);
  expect(errors).toEqual([]);
});
test("scroll text becomes sharp before reading position, and reverses", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");
  const text = page.locator("#perspective-title");
  const top = await text.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate(
    (y) =>
      window.scrollTo({ top: y - innerHeight * 0.89, behavior: "instant" }),
    top,
  );
  await expect
    .poll(async () => Number(await text.getAttribute("data-focus-progress")))
    .toBeLessThan(0.3);
  await expect(text.locator("[data-word]").first()).not.toHaveCSS(
    "filter",
    "blur(0px)",
  );
  await page.evaluate(
    (y) => window.scrollTo({ top: y - innerHeight * 0.4, behavior: "instant" }),
    top,
  );
  await expect(text).toHaveAttribute("data-focus-progress", "1.000");
  await expect(text.locator("[data-word]").last()).toHaveCSS(
    "filter",
    "blur(0px)",
  );
  await page.screenshot({ path: "/workspace/work/pixel-perspective.png" });
  await page.evaluate(
    (y) =>
      window.scrollTo({ top: y - innerHeight * 0.89, behavior: "instant" }),
    top,
  );
  await expect
    .poll(async () => Number(await text.getAttribute("data-focus-progress")))
    .toBeLessThan(0.3);
});
test("reduced motion has no pixel animation and all text remains clear", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".pixel-mountain")).toHaveAttribute(
    "data-phase",
    "clear",
  );
  await expect(
    page.getByRole("button", { name: "Replay image focus animation" }),
  ).toHaveCount(0);
  await page.locator("#perspective").scrollIntoViewIfNeeded();
  await expect(
    page.locator("#perspective-title [data-word]").first(),
  ).toHaveCSS("filter", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
test("canvas unavailable retains the photograph", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.locator(".pixel-mountain")).toHaveCSS(
    "background-image",
    /mountain-still.webp/,
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "clarity to complexity.",
  );
});
