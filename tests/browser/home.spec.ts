import { test, expect, type Page } from "@playwright/test";
async function loadVisibleImages(page: Page) {
  for (const img of await page.locator("img:visible").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        img.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(
    () =>
      Number(
        document.querySelector(".mountain")?.getAttribute("data-progress"),
      ) === (matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0),
  );
}

test("desktop renders WebGL, scroll reverses, pause works, navigation reaches contact", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      (
        window as Window & { __trickfilmVideo?: HTMLMediaElement }
      ).__trickfilmVideo = this;
      return play.call(this);
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(
    "Trickfilm brings clarity to complexity.",
  );
  const copy = await page.locator(".hero-copy").boundingBox();
  const media = await page.locator(".mountain").boundingBox();
  expect(media!.x).toBeGreaterThan(500);
  expect(media!.y).toBeLessThan(copy!.y + 100);
  const mountain = page.locator(".mountain");
  await expect(mountain.locator("canvas")).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __trickfilmVideo?: HTMLMediaElement })
            .__trickfilmVideo?.currentTime ?? 0,
      ),
    )
    .toBeGreaterThan(0.1);
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __trickfilmVideo?: HTMLVideoElement })
          .__trickfilmVideo?.videoWidth,
    ),
  ).toBe(1920);
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(
    page.getByRole("button", { name: "Play motion" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __trickfilmVideo?: HTMLMediaElement })
            .__trickfilmVideo?.paused,
      ),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "instant" }));
  await expect
    .poll(async () => Number(await mountain.getAttribute("data-progress")))
    .toBeGreaterThan(0.4);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect
    .poll(async () => Number(await mountain.getAttribute("data-progress")))
    .toBe(0);
  await loadVisibleImages(page);
  await page.screenshot({ path: "/workspace/work/reference-size.png" });
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
  await loadVisibleImages(page);
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
    /summit-poster.webp/,
  );
  await expect(page.locator(".mountain canvas")).toHaveCSS("opacity", "0");
});

test("services menu links to the selected service", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator(".services-menu summary").click();
  await page.getByRole("link", { name: "AI consulting", exact: true }).click();
  await expect(page.locator("#service-04")).toBeInViewport();
  await expect(page.locator("#service-04")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel")).toContainText(
    "Find the useful in the possible.",
  );
});

test("service explorer responds to clicks and keyboard without moving focus unexpectedly", async ({
  page,
}) => {
  await page.goto("/");
  const tabs = page.getByRole("tab");
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Give good people their time back.",
  );
  await tabs.nth(1).press("ArrowDown");
  await expect(tabs.nth(2)).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText(
    "A better fit for the way you work.",
  );
  await page
    .getByRole("tabpanel")
    .screenshot({ path: "/workspace/work/services-panel.png" });
});

test("selected work shows all five supplied sites with loaded local screenshots", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See our work", exact: true }).click();
  await expect(page.locator("#work")).toBeInViewport();
  const cards = page.locator(".project-card");
  await expect(cards).toHaveCount(5);
  const urls = [
    "https://gowermodernlaw.com/",
    "https://nvfc.ca/",
    "https://www.streamworksdesigns.com/",
    "https://accesstojusticebc.ca/",
    "https://www.stratacouncil.ca/",
  ];
  for (let i = 0; i < urls.length; i++) {
    await expect(cards.nth(i)).toHaveAttribute("href", urls[i]);
    await expect(cards.nth(i)).toHaveAttribute("target", "_blank");
    await cards.nth(i).scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        cards
          .nth(i)
          .locator("img")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
  }
  await page
    .locator("#work")
    .screenshot({ path: "/workspace/work/selected-work.png" });
});

test("mobile motion uses only the optimized uploaded mobile video", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const sources = new Set<string>();
  page.on("request", (r) => {
    if (r.url().includes(".mp4")) sources.add(new URL(r.url()).pathname);
  });
  await page.goto("/");
  await expect(page.locator(".mountain canvas")).toHaveCSS("opacity", "1");
  await expect.poll(() => sources.size).toBe(1);
  expect([...sources]).toEqual(["/media/summit-mobile.mp4"]);
});

test("native lens paths preserve the supplied tapered openings", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".mountain canvas")).toHaveCSS("opacity", "1");
  await expect(page.locator(".lens-outlines")).toHaveCSS("opacity", "1");
  const paths = page.locator(".lens-outlines path[data-lens]");
  await expect(paths).toHaveCount(5);
  const apertures = [
    { x: 122.98, y: 134.09, radius: 107.61 },
    { x: 112.455, y: 126.445, radius: 107.61 },
    { x: 116.47, y: 114.01, radius: 107.61 },
    { x: 129.52, y: 114.01, radius: 107.61 },
    { x: 133.575, y: 126.445, radius: 107.61 },
  ];
  for (let i = 0; i < 5; i++) {
    const aligned = await paths.nth(i).evaluate((node, hole) => {
      const path = node as SVGGeometryElement;
      for (let j = 0; j < 16; j++) {
        const angle = (j * Math.PI) / 8;
        const inside = new DOMPoint(
          hole.x + Math.cos(angle) * (hole.radius - 0.25),
          hole.y + Math.sin(angle) * (hole.radius - 0.25),
        );
        const border = new DOMPoint(
          hole.x + Math.cos(angle) * (hole.radius + 0.25),
          hole.y + Math.sin(angle) * (hole.radius + 0.25),
        );
        if (path.isPointInFill(inside) || !path.isPointInFill(border))
          return false;
      }
      return true;
    }, apertures[i]);
    expect(aligned).toBe(true);
  }
  await page
    .locator(".mountain")
    .screenshot({ path: "/workspace/work/lens-artwork.png" });
});
