import { test, expect } from "@playwright/test";
test("portfolio routes, contact, and logo gallery work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Good ideas.Beautifully executed.",
  );
  await expect(
    page.locator('a[href="mailto:jeremy@trickfilm.com"]').first(),
  ).toBeAttached();
  const cards = page.locator(".project-panel");
  await expect(cards).toHaveCount(6);
  const routes = await cards.evaluateAll((a) =>
    a.map((el) => el.getAttribute("href")!),
  );
  for (const route of routes) {
    const response = await page.request.get(route);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("View");
  }
  const first = page.locator("[data-original] .identity-card").first();
  await page.locator(".identity-viewport").hover();
  await first.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const title = await dialog.locator("#identity-dialog-title").textContent();
  await page.getByRole("button", { name: "Next logo", exact: true }).click();
  await expect(dialog.locator("#identity-dialog-title")).not.toHaveText(title!);
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator("#identity-dialog-title")).toHaveText(title!);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(first).toBeFocused();
  await expect(page.locator("[data-original] .identity-card")).toHaveCount(18);
  expect(errors).toEqual([]);
  await page.goto("/work/not-a-project");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});
for (const width of [390, 768, 1440])
  test(`responsive layout ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".hero-wordmark img")).toBeVisible();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  });
test("content works without JavaScript and with reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-original] .identity-card")).toHaveCount(18);
  await expect(page.locator("[data-clone]").first()).not.toBeVisible();
  expect(
    await page.locator(".identity-card").first().getAttribute("href"),
  ).toMatch(/\.webp$/);
  await context.close();
});

test("desktop project surfaces overlap and release after the final project", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const cards = page.locator(".project-stack .project-panel");
  const start = await cards
    .first()
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (y) => scrollTo({ top: y + 280, behavior: "instant" }),
    start,
  );
  await expect
    .poll(async () => Math.round((await cards.first().boundingBox())!.y))
    .toBe(24);
  const secondStart = await cards
    .nth(1)
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (y) => scrollTo({ top: y - 160, behavior: "instant" }),
    secondStart,
  );
  const secondBox = (await cards.nth(1).boundingBox())!;
  expect(secondBox.y).toBeLessThan(200);
  expect(secondBox.y).toBeGreaterThan(24);
  const covering = await page.evaluate(() =>
    document
      .elementFromPoint(innerWidth / 2, 300)
      ?.closest(".project-panel")
      ?.getAttribute("href"),
  );
  expect(covering).toContain("north-vancouver-fc");
  await page.locator("#branding").scrollIntoViewIfNeeded();
  expect((await cards.last().boundingBox())!.y).toBeLessThan(24);
  await expect(
    page.getByRole("link", { name: "Trickfilm home", exact: true }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Trickfilm home", exact: true }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("motion preference disables stacking and all decorative animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  expect(
    await page
      .locator(".project-stack .project-panel")
      .first()
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("relative");
  await page.locator("#services").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
  ).toBe(0);
});

test("all project pages fit a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const routes = await page
    .locator(".project-panel")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
    const back = page.getByRole("link", { name: "Back to work", exact: false });
    await expect(back).toBeInViewport();
  }
});

test("services keep their visual in place and change it with the scrolling copy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rows = page.locator("[data-service]");
  for (let i = 0; i < 3; i++) {
    await rows.nth(i).evaluate((el) => {
      const y = el.getBoundingClientRect().top + scrollY;
      scrollTo({ top: y, behavior: "instant" });
    });
    await expect(page.locator('.service-glyph[data-active="true"]')).toHaveText(
      String(i + 1),
    );
    const box = (await page.locator(".services-stage").boundingBox())!;
    expect(Math.abs(box.y)).toBeLessThan(2);
  }
  await rows.first().evaluate((el) =>
    scrollTo({
      top: el.getBoundingClientRect().top + scrollY,
      behavior: "instant",
    }),
  );
  await expect(page.locator('.service-glyph[data-active="true"]')).toHaveText(
    "1",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".services-stage")).not.toBeVisible();
  await expect(rows.first().getByRole("heading", { level: 3 })).toBeVisible();
});

test("contact validates, retains failed messages, and acknowledges accepted delivery", async ({
  page,
}) => {
  await page.goto("/");
  const invalid = await page.request.post("/api/contact", {
    multipart: {
      name: "Visitor",
      email: "invalid",
      message: "A website enquiry.",
    },
    headers: { Accept: "application/json" },
  });
  expect(invalid.status()).toBe(400);
  const form = page.locator(".contact-form");
  await form.scrollIntoViewIfNeeded();
  await form.getByRole("button", { name: "Send enquiry" }).click();
  expect(
    await form
      .locator('input[name="name"]')
      .evaluate((el) => (el as HTMLInputElement).validity.valueMissing),
  ).toBe(true);
  await form.getByLabel("Your name").fill("Jane Visitor");
  await form.getByLabel("Email address").fill("jane@example.com");
  await form
    .getByLabel("What do you have in mind?")
    .fill("We would love to talk about a website.");
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unavailable" }),
    }),
  );
  await form.getByRole("button", { name: "Send enquiry" }).click();
  await expect(form.getByRole("alert")).toContainText("couldn’t be sent");
  await expect(form.getByLabel("Your name")).toHaveValue("Jane Visitor");
  await page.unroute("**/api/contact");
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Accepted" }),
    }),
  );
  await form.getByRole("button", { name: "Send enquiry" }).click();
  await expect(form.locator(".contact-status")).toContainText(
    "your message has been sent",
  );
  await expect(form.getByLabel("Your name")).toHaveValue("");
});

test("logo carousel shows five desktop cards, wraps both ways, and pauses", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rail = page.locator(".identity-viewport");
  await rail.scrollIntoViewIfNeeded();
  await expect(page.locator(".identity-track")).toHaveAttribute(
    "data-loop-ready",
    "true",
  );
  const dimensions = await rail.evaluate((el) => {
    const card = el.querySelector(".identity-card")!;
    return {
      viewport: el.clientWidth,
      card: card.getBoundingClientRect().width,
    };
  });
  expect(
    Math.abs(dimensions.viewport - (dimensions.card * 5 + 80)),
  ).toBeLessThan(2);
  const start = await rail.evaluate((el) => el.scrollLeft);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(start + 5);
  await page
    .getByRole("button", { name: "Pause logo carousel", exact: true })
    .click();
  const stopped = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(200);
  expect(
    Math.abs((await rail.evaluate((el) => el.scrollLeft)) - stopped),
  ).toBeLessThan(1);
  const period = await page
    .locator("[data-original]")
    .evaluate((el) => el.getBoundingClientRect().width + 20);
  await rail.evaluate((el, p) => {
    el.scrollLeft = p * 2 + 15;
  }, period);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeLessThan(period + 30);
  await rail.evaluate((el, p) => {
    el.scrollLeft = p - 15;
  }, period);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(period * 2 - 30);
  await page.getByRole("button", { name: "Scroll logos right" }).click();
  await expect
    .poll(async () =>
      Math.abs(
        (await rail.evaluate((el) => el.scrollLeft)) -
          (period + dimensions.card + 20 - 15),
      ),
    )
    .toBeLessThan(2);
  expect(
    await page
      .locator("[data-clone] a")
      .evaluateAll((els) =>
        els.every((el) => (el as HTMLElement).tabIndex === -1),
      ),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () =>
      rail.evaluate(
        (el) =>
          Math.round(
            el.querySelector(".identity-card")!.getBoundingClientRect().width *
              2 +
              20,
          ) - el.clientWidth,
      ),
    )
    .toBe(0);
});

test("reduced-motion carousel is manual and still previews all logos", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const rail = page.locator(".identity-viewport");
  await rail.scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Pause logo carousel", exact: true }),
  ).toHaveCount(0);
  const before = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(200);
  expect(await rail.evaluate((el) => el.scrollLeft)).toBe(before);
  await page.getByRole("button", { name: "Scroll logos right" }).click();
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(before + 50);
  const first = page.locator("[data-original] .identity-card").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".dialog-controls > p")).toHaveText("18 / 18");
  await page.keyboard.press("Escape");
  await expect(first).toBeFocused();
});

test("automatic logo motion crosses the loop seam and stops on hover", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rail = page.locator(".identity-viewport");
  await rail.scrollIntoViewIfNeeded();
  await expect(page.locator(".identity-track")).toHaveAttribute(
    "data-loop-ready",
    "true",
  );
  const size = await page
    .locator("[data-original]")
    .evaluate((el) => el.getBoundingClientRect().width + 20);
  await rail.evaluate((el, p) => {
    el.scrollLeft = p * 2 - 4;
  }, size);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeLessThan(size + 40);
  const after = await rail.evaluate((el) => el.scrollLeft);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(after + 5);
  await rail.hover();
  const stopped = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(200);
  expect(
    Math.abs((await rail.evaluate((el) => el.scrollLeft)) - stopped),
  ).toBeLessThan(1);
  await page.mouse.move(0, 0);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(stopped + 5);
});
