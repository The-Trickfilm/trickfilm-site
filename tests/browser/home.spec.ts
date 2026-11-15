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
  await page
    .locator(".work-gallery")
    .evaluate((root) => root.scrollTo({ left: 0, behavior: "instant" }));
  await expect(page.locator(".project-card").first()).toHaveAttribute(
    "aria-current",
    "true",
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(
    () =>
      Number(
        document.querySelector(".mountain")?.getAttribute("data-progress"),
      ) === (matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0),
  );
}

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
    /mountain-still.webp/,
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

test("gallery arrows center the full-color project and keep neighbours monochrome", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator("#work").scrollIntoViewIfNeeded();
  const cards = page.locator(".work-gallery .project-card");
  await expect(cards.first()).toHaveAttribute("aria-current", "true");
  await expect(cards.first().locator("img")).toHaveCSS("filter", "none");
  await expect(cards.nth(1).locator("img")).not.toHaveCSS("filter", "none");
  await expect(
    page.getByRole("button", { name: "Previous project" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next project" }).click();
  await expect
    .poll(() => cards.nth(1).getAttribute("aria-current"))
    .toBe("true");
  await expect(cards.nth(1).locator("img")).toHaveCSS("filter", "none");
  await expect(cards.first().locator("img")).not.toHaveCSS("filter", "none");
  await page.getByRole("button", { name: "Previous project" }).click();
  await expect
    .poll(() => cards.first().getAttribute("aria-current"))
    .toBe("true");
  await cards.first().focus();
  const scrollY = await page.evaluate(() => window.scrollY);
  await cards.first().press("ArrowRight");
  await expect(cards.nth(1)).toBeFocused();
  await expect
    .poll(() => cards.nth(1).getAttribute("aria-current"))
    .toBe("true");
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
  await cards.nth(1).press("End");
  await expect
    .poll(() => cards.nth(4).getAttribute("aria-current"))
    .toBe("true");
  await expect(
    page.getByRole("button", { name: "Next project" }),
  ).toBeDisabled();
  await cards.nth(4).press("Home");
  await expect
    .poll(() => cards.first().getAttribute("aria-current"))
    .toBe("true");
  await page.locator("#work").screenshot({
    path: "/workspace/work/work-gallery.png",
    style: ".header,.skip{visibility:hidden!important}",
  });
});
