import { test, expect } from "@playwright/test";
test("desktop renders WebGL, scroll reverses, pause works, navigation reaches contact", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(
    "Trickfilm bringsclarity to complexity.",
  );
  const mountain = page.locator(".mountain");
  await expect(mountain.locator("canvas")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(
    page.getByRole("button", { name: "Play motion" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "instant" }));
  await expect
    .poll(async () => Number(await mountain.getAttribute("data-progress")))
    .toBeGreaterThan(0.4);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect
    .poll(async () => Number(await mountain.getAttribute("data-progress")))
    .toBe(0);
  await page.screenshot({
    path: "/workspace/work/desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Let's solve something" }).click();
  await expect(page.locator("#contact")).toBeInViewport();
  expect(errors).toEqual([]);
});
test("mobile fits viewport and reduced motion avoids video download", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  let videoRequests = 0;
  page.on("request", (r) => {
    if (r.url().endsWith(".mp4")) videoRequests++;
  });
  await page.goto("/");
  await expect(page.locator(".mountain canvas")).toHaveCSS("opacity", "1");
  expect(videoRequests).toBe(0);
  await expect(page.getByRole("button", { name: "Pause motion" })).toHaveCount(
    0,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({ path: "/workspace/work/mobile.png", fullPage: true });
});
test("WebGL unavailable keeps static fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl") return null;
      return Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
  await page.goto("/");
  await expect(page.locator(".mountain")).toHaveCSS(
    "background-image",
    /mountain-poster.webp/,
  );
  await expect(page.locator(".mountain canvas")).toHaveCSS("opacity", "0");
});
