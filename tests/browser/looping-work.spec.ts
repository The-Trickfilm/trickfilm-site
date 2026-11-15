import { test, expect } from "@playwright/test";
test("arrows, keyboard and native horizontal scrolling wrap in both directions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator("#work").scrollIntoViewIfNeeded();
  const cards = page.locator(".project-card[data-original=true]"),
    root = page.locator(".work-gallery");
  await page.getByRole("button", { name: "Previous project" }).click();
  await expect(cards.last()).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Next project" }).click();
  await expect(cards.first()).toHaveAttribute("aria-current", "true");
  await cards.first().evaluate((el) => el.focus({ preventScroll: true }));
  await cards.first().press("ArrowLeft");
  await expect(cards.last()).toBeFocused();
  await expect(cards.last()).toHaveAttribute("aria-current", "true");
  await cards.last().press("ArrowRight");
  await expect(cards.first()).toBeFocused();
  await expect(cards.first()).toHaveAttribute("aria-current", "true");
  // Cross the end using the scroll container itself, as a touch/trackpad gesture does.
  await root.evaluate((el) => {
    const card = el.querySelectorAll<HTMLElement>(".project-card")[10];
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: "instant",
    });
  });
  await expect(cards.first()).toHaveAttribute("aria-current", "true");
  await expect
    .poll(() =>
      root.evaluate((el) => {
        const first = el.querySelector<HTMLElement>("[data-original=true]")!;
        return Math.abs(
          el.scrollLeft -
            (first.offsetLeft - (el.clientWidth - first.offsetWidth) / 2),
        );
      }),
    )
    .toBeLessThan(2);
  expect(
    await cards.first().evaluate((el) => el.getBoundingClientRect().width),
  ).toBeLessThan(530);
  await page.locator("#work").screenshot({
    path: "/workspace/work/work-gallery.png",
    style: ".header,.skip{visibility:hidden!important}",
  });
});
test("all 18 supplied logo images are available, preserve their aspect ratios, and loop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("tab", { name: "Logo design" }).click();
  const cards = page.locator(".project-card[data-original=true]");
  await expect(cards).toHaveCount(18);
  await expect(
    page.getByRole("region", { name: "Selected logo design gallery" }),
  ).toBeVisible();
  for (const img of await cards.locator("img").all()) {
    const src = await img.getAttribute("src");
    expect(src).toContain("work%2Flogos");
    const loaded = await img.evaluate(async (el: HTMLImageElement) => {
      el.loading = "eager";
      await el.decode();
      return el.naturalWidth > 0 && el.naturalHeight > 0;
    });
    expect(loaded).toBe(true);
    await expect(img).toHaveCSS("object-fit", "contain");
  }
  await page.getByRole("button", { name: "Previous project" }).click();
  await expect(cards.last()).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Next project" }).click();
  await expect(cards.first()).toHaveAttribute("aria-current", "true");
  await page.locator("#work").screenshot({
    path: "/workspace/work/logo-gallery.png",
    style: ".header,.skip{visibility:hidden!important}",
  });
  await page.getByRole("tab", { name: "Websites" }).click();
  await expect(page.locator(".project-card[data-original=true]")).toHaveCount(
    5,
  );
});
test("mobile gallery wraps after a native scroll and has no page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.locator(".work-gallery").evaluate((el) => {
    const card = el.querySelectorAll<HTMLElement>(".project-card")[4];
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: "instant",
    });
  });
  await expect(
    page.locator(".project-card[data-original=true]").last(),
  ).toHaveAttribute("aria-current", "true");
  await page.getByRole("tab", { name: "Logo design" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.locator("#work").screenshot({
    path: "/workspace/work/logo-mobile.png",
    style: ".header,.skip{visibility:hidden!important}",
  });
});
test("without JavaScript the visible portfolio contains usable original links", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  await page.goto(baseURL!);
  const first = page.locator(".project-card[data-original=true]").first();
  await expect(first).toHaveAttribute("href", "https://gowermodernlaw.com/");
  await first.scrollIntoViewIfNeeded();
  await expect(first).toBeInViewport();
  await expect(page.locator(".project-card[inert]").first()).not.toBeVisible();
  await context.close();
});
