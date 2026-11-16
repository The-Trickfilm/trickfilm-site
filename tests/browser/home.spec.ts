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
  await expect(cards).toHaveCount(7);
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
    if (width === 390)
      expect(
        await page
          .locator("#contact")
          .evaluate((el) => parseFloat(getComputedStyle(el).paddingTop)),
      ).toBeGreaterThanOrEqual(88);
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
    .toBe(64);
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
  for (let i = 0; i < 5; i++) {
    await rows.nth(i).evaluate((el) => {
      const y =
        el.getBoundingClientRect().top +
        scrollY +
        el.getBoundingClientRect().height / 2 -
        innerHeight / 2;
      scrollTo({ top: y, behavior: "instant" });
    });
    await expect(page.locator('.service-glyph[data-active="true"]')).toHaveText(
      String(i + 1),
    );
    const box = (await page.locator(".services-stage").boundingBox())!;
    expect(Math.abs(box.y - (1000 - box.height) / 2)).toBeLessThan(2);
  }
  await rows.first().evaluate((el) =>
    scrollTo({
      top:
        el.getBoundingClientRect().top +
        scrollY +
        el.getBoundingClientRect().height / 2 -
        innerHeight / 2,
      behavior: "instant",
    }),
  );
  await expect(page.locator('.service-glyph[data-active="true"]')).toHaveText(
    "1",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator(".services-stage .service-symbols"),
  ).not.toBeVisible();
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

test("service flower follows scroll while the numeral stays upright", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const first = page.locator('[data-service="0"]');
  const start = await first.evaluate(
    (el) =>
      el.getBoundingClientRect().top +
      scrollY +
      el.getBoundingClientRect().height / 2 -
      innerHeight / 2,
  );
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), start);
  const flower = page.locator(".services-flower");
  await expect
    .poll(() =>
      flower.evaluate((el) => getComputedStyle(el, "::before").transform),
    )
    .not.toBe("none");
  const before = await flower.evaluate(
    (el) => getComputedStyle(el, "::before").transform,
  );
  await page.evaluate(
    (y) => scrollTo({ top: y + 100, behavior: "instant" }),
    start,
  );
  await expect
    .poll(() =>
      flower.evaluate((el) => getComputedStyle(el, "::before").transform),
    )
    .not.toBe(before);
  expect(
    await page
      .locator('.service-glyph[data-active="true"] .service-number')
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), start);
  await expect
    .poll(() =>
      flower.evaluate((el) => getComputedStyle(el, "::before").transform),
    )
    .toBe(before);
  expect(
    await first.evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThan(550);
  expect(await page.locator(".flower-accent").count()).toBe(8);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      flower.evaluate((el) => getComputedStyle(el, "::before").transform),
    )
    .toBe("none");
});

test("five service headings stay consistent while copy fades through focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rows = page.locator("[data-service]");
  await expect(rows.locator("h3")).toHaveText([
    "Web design",
    "Branding",
    "Graphic Design",
    "Workflow Automation",
    "Business Process Design",
  ]);
  const center = async (index: number) => {
    await rows.nth(index).evaluate((el) =>
      scrollTo({
        top:
          el.getBoundingClientRect().top +
          scrollY +
          el.getBoundingClientRect().height / 2 -
          innerHeight / 2,
        behavior: "instant",
      }),
    );
  };
  await center(1);
  await expect
    .poll(() =>
      rows
        .nth(1)
        .locator(".service-copy")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.99);
  await expect
    .poll(() =>
      rows
        .nth(0)
        .locator(".service-copy")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeLessThan(0.1);
  await expect(page.locator("#services-heading")).toBeInViewport();
  const title = await page.locator("#services-heading").boundingBox();
  await center(3);
  await expect
    .poll(() =>
      rows
        .nth(1)
        .locator(".service-copy")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeLessThan(0.1);
  await expect
    .poll(() =>
      rows
        .nth(3)
        .locator(".service-copy")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.99);
  expect(
    Math.abs(
      (await page.locator("#services-heading").boundingBox())!.y - title!.y,
    ),
  ).toBeLessThan(2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let i = 0; i < 5; i++)
    expect(
      await rows
        .nth(i)
        .locator(".service-copy")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  await expect(page.locator("#services-heading")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await center(2);
  await expect
    .poll(() =>
      rows.nth(2).evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.99);
  await expect
    .poll(() =>
      rows.first().evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeLessThan(0.1);
});

test("page frames share a contained grid and full-height main sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  for (const id of ["intro", "branding", "applications", "about", "contact"])
    expect(
      (await page.locator(`#${id}`).boundingBox())!.height,
      id,
    ).toBeGreaterThanOrEqual(999);
  const positions = await page.evaluate(() =>
    [
      ".project-info",
      ".services-stage",
      "#about .eyebrow",
      ".contact-introduction",
    ].map(
      (selector) =>
        document.querySelector(selector)!.getBoundingClientRect().left,
    ),
  );
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(2);
  const columns = await page.evaluate(() =>
    [
      ".project-visual",
      ".service-copy",
      "#about .section-introduction > div",
      ".contact-form",
    ].map(
      (selector) =>
        document.querySelector(selector)!.getBoundingClientRect().left,
    ),
  );
  expect(Math.max(...columns) - Math.min(...columns)).toBeLessThan(2);
  const card = (await page
    .locator(".project-stack .project-panel")
    .first()
    .boundingBox())!;
  expect(card.x).toBeGreaterThan(80);
  expect(card.width).toBeLessThanOrEqual(1280);
  expect(
    (await page.locator(".contact-form").boundingBox())!.width,
  ).toBeLessThanOrEqual(480);
});

test("Koan paper card and full business process diagram are available", async ({
  page,
}) => {
  await page.goto("/");
  const websites = page.locator("#work .project-panel");
  await expect(websites.nth(4)).toHaveClass(/tone-paper/);
  await expect(websites.nth(4)).toHaveAttribute("href", "/work/koan-analytics");
  const diagram = page.locator(".service-process");
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toHaveAttribute(
    "href",
    "/work/processes/business-process.png",
  );
  const img = diagram.locator("img");
  await expect(img).toBeVisible();
  await expect(img).toHaveCSS("object-fit", "contain");
  await expect
    .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  expect(
    (await page.request.get("/work/processes/business-process.png")).status(),
  ).toBe(200);
});
