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
  await expect(cards).toHaveCount(10);
  const routes = await cards.evaluateAll((a) =>
    a.map((el) => el.getAttribute("data-project-href")!),
  );
  for (const route of routes) {
    const response = await page.request.get(route);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("View");
  }
  const carousel = page.locator(".identity-carousel");
  await expect(carousel.locator("[data-original] .identity-card")).toHaveCount(
    18,
  );
  await expect(
    carousel.locator(".identity-card a, a.identity-card"),
  ).toHaveCount(0);
  await carousel.locator("[data-original] .identity-card").first().click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
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
  await expect(page.locator(".identity-carousel a")).toHaveCount(0);
  await context.close();
});

test("desktop project surfaces overlap and release after the final project", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const cards = page.locator("#work .project-stack .project-panel");
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
      ?.getAttribute("data-project-href"),
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
    .evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-project-href")!),
    );
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
  await expect(
    page.locator(
      "[data-clone] a, [data-clone] button, [data-clone] [tabindex]",
    ),
  ).toHaveCount(0);
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

test("reduced-motion carousel is manual and logos remain view-only", async ({
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
  await rail.focus();
  await expect(rail).toBeFocused();
  await expect(page.locator(".identity-carousel a")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
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
  expect(await page.locator(".flower-accent").count()).toBe(7);
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

test("Koan charcoal card and full business process diagram are available", async ({
  page,
}) => {
  await page.goto("/");
  const websites = page.locator("#work .project-panel");
  await expect(websites.nth(4)).toHaveClass(/tone-charcoal/);
  await expect(websites.nth(4)).toHaveAttribute(
    "data-project-href",
    "/work/koan-analytics",
  );
  await expect(page.locator("#services img")).toHaveCount(0);
  const diagram = page.locator(
    '#applications .project-panel[data-project-href="/work/business-process-design"]',
  );
  await expect(diagram).toHaveAttribute(
    "data-project-href",
    "/work/business-process-design",
  );
  await expect(diagram.locator(".eyebrow")).toHaveText("(Creative solutions)");
  await diagram.scrollIntoViewIfNeeded();
  const img = diagram.locator("img");
  await expect(img).toBeVisible();
  await expect(img).toHaveCSS("object-fit", "contain");
  await expect
    .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await page.goto("/work/business-process-design");
  await expect(
    page.getByRole("link", { name: /View full-size diagram/ }),
  ).toHaveAttribute("href", "/work/processes/business-process.png");
});

test("creative solutions stack like web cards with matching landscape heights", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const websites = page.locator("#work .project-panel");
  const solutions = page.locator("#applications .project-panel");
  await expect(solutions).toHaveCount(4);
  const targetHeight = (await solutions.first().boundingBox())!.height;
  expect(targetHeight).toBeLessThan(700);
  for (const card of [...(await websites.all()), ...(await solutions.all())]) {
    expect(
      Math.abs((await card.boundingBox())!.height - targetHeight),
    ).toBeLessThan(2);
    await expect(card).toHaveCSS("position", "sticky");
  }
  const start = await solutions
    .first()
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (y) => scrollTo({ top: y + 200, behavior: "instant" }),
    start,
  );
  await expect
    .poll(async () => Math.round((await solutions.first().boundingBox())!.y))
    .toBe(64);
  const secondStart = await solutions
    .last()
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (y) => scrollTo({ top: y - 160, behavior: "instant" }),
    secondStart,
  );
  expect(
    await page.evaluate(() =>
      document
        .elementFromPoint(innerWidth / 2, 300)
        ?.closest(".project-panel")
        ?.getAttribute("data-project-href"),
    ),
  ).toBe("/work/thunderbird-entertainment");
  await page.locator("#services").scrollIntoViewIfNeeded();
  expect((await solutions.last().boundingBox())!.y).toBeLessThan(24);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(solutions.first()).toHaveCSS("position", "relative");
});

test("Talent Creative HR alternates every three seconds and supports pause and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const card = page.locator('[data-project-href="/work/talent-creative-hr"]');
  const screen = card.locator(".screen-slideshow");
  await screen.scrollIntoViewIfNeeded();
  const active = () => screen.locator('[data-preview-active="true"] img');
  await expect(active()).toHaveAttribute("alt", /circular process/);
  await page.waitForTimeout(2400);
  await expect(active()).toHaveAttribute("alt", /circular process/);
  await expect(active()).toHaveAttribute("alt", /Employee-retention stages/, {
    timeout: 1800,
  });
  await expect(active()).toHaveAttribute("alt", /circular process/, {
    timeout: 3500,
  });
  await card
    .getByRole("button", { name: "Pause Talent Creative HR preview" })
    .click();
  const before = await active().getAttribute("alt");
  await page.waitForTimeout(3200);
  expect(await active().getAttribute("alt")).toBe(before);
  await card
    .getByRole("button", { name: "Next Talent Creative HR image" })
    .click();
  expect(await active().getAttribute("alt")).not.toBe(before);
  await expect(page).toHaveURL(/\/$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/talent-creative-hr");
  const detail = page.locator(".screen-slideshow");
  await detail.scrollIntoViewIfNeeded();
  await expect(detail.getByRole("button", { name: /Pause/ })).toHaveCount(0);
  await page.waitForTimeout(3200);
  await expect(
    detail.locator('[data-preview-active="true"] img'),
  ).toHaveAttribute("alt", /circular process/);
  await detail
    .getByRole("button", { name: "Next Talent Creative HR image" })
    .click();
  await expect(
    detail.locator('[data-preview-active="true"] img'),
  ).toHaveAttribute("alt", /Employee-retention stages/);
});

test("supplied identities are visible artwork without links or preview dialogs", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const originals = page.locator("[data-original]");
  for (const name of ["Talent Creative HR", "Beat Bugs", "All Well & Good"]) {
    const card = originals.locator(".identity-card").filter({ hasText: name });
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card
          .locator("img")
          .evaluate((i) => (i as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await expect(
    originals.getByRole("heading", {
      name: "Houndz Unleashed — character",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    originals.getByRole("heading", { name: "XDI — application", exact: true }),
  ).toHaveCount(0);
  await expect(
    originals.getByRole("heading", { name: "Houndz Unleashed", exact: true }),
  ).toHaveCount(1);
  await expect(
    originals.getByRole("heading", { name: "XDI", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.locator(".identity-carousel a, .identity-caption svg"),
  ).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("shared homepage links explicitly use the hero screenshot for browsers and crawlers", async ({
  page,
}) => {
  const imageURL =
    "https://trickfilm-site.vercel.app/share/trickfilm-hero-v1.jpg";
  await page.goto("/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    imageURL,
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    "1200",
  );
  await expect(
    page.locator('meta[property="og:image:height"]'),
  ).toHaveAttribute("content", "900");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    imageURL,
  );
  for (const agent of [
    "facebookexternalhit/1.1",
    "Twitterbot/1.0",
    "Mozilla/5.0 AppleWebKit/605.1.15 Safari/605.1.15",
  ]) {
    const response = await page.request.get("/", {
      headers: { "User-Agent": agent },
    });
    expect(response.status()).toBe(200);
    const head = (await response.text()).split("</head>")[0];
    expect(head).toContain(imageURL);
    expect(head).not.toContain("/work/gower.webp");
  }
  const image = await page.request.get(new URL(imageURL).pathname);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/jpeg");
  await page.goto(new URL(imageURL).pathname);
  await expect
    .poll(() =>
      page.locator("img").evaluate((i) => (i as HTMLImageElement).naturalWidth),
    )
    .toBe(1200);
  expect(
    await page
      .locator("img")
      .evaluate((i) => (i as HTMLImageElement).naturalHeight),
  ).toBe(900);
});

test("creative cards lead with services and do not link to project pages", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator("#applications .project-panel");
  await expect(cards.locator("h3")).toHaveText([
    "Applications & Automation",
    "Business Process Design",
    "Business Process Design",
    "Presentation Design",
  ]);
  await expect(cards.locator("a")).toHaveCount(0);
  await expect(cards.locator(".project-cta")).toHaveCount(0);
  await expect(page.locator("#work .project-card-link")).toHaveCount(6);
  await expect(cards.nth(2).locator(".project-facts")).toContainText(
    "Talent Creative HR",
  );
});

test("presentation plays all nine slides in a two-second loop on charcoal", async ({
  page,
}) => {
  test.setTimeout(45000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const card = page.locator(
    '[data-project-href="/work/thunderbird-entertainment"]',
  );
  const screen = card.locator(".screen-slideshow");
  await screen.scrollIntoViewIfNeeded();
  await expect(screen.locator(".preview-frame")).toHaveCount(9);
  await expect(screen.locator(".laptop-display")).toHaveCSS(
    "background-color",
    "rgb(37, 37, 37)",
  );
  const active = () => screen.locator('[data-preview-active="true"] img');
  await expect(active()).toHaveAttribute("alt", /slide 1:/);
  await page.waitForTimeout(1400);
  await expect(active()).toHaveAttribute("alt", /slide 1:/);
  for (let slide = 2; slide <= 9; slide++) {
    await expect(active()).toHaveAttribute(
      "alt",
      new RegExp(`slide ${slide}:`),
      { timeout: 2600 },
    );
    await expect(active()).toHaveCSS("object-fit", "contain");
    await expect
      .poll(() =>
        active().evaluate((i) => (i as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await expect(active()).toHaveAttribute("alt", /slide 1:/, { timeout: 2600 });
  await card
    .getByRole("button", { name: "Pause Thunderbird Entertainment preview" })
    .click();
  await page.waitForTimeout(2200);
  await expect(active()).toHaveAttribute("alt", /slide 1:/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    card.getByRole("button", { name: /Play .* preview/ }),
  ).toHaveCount(0);
  await card
    .getByRole("button", { name: "Next Thunderbird Entertainment image" })
    .click();
  await expect(active()).toHaveAttribute("alt", /slide 2:/);
  await page.waitForTimeout(2200);
  await expect(active()).toHaveAttribute("alt", /slide 2:/);
});

test("Quality Engineering kit is styled, responsive, and downloads its draft files", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/brand/quality-engineering");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Confidence.In every build.",
    );
    const cover = page.locator("main > section").first();
    await expect(cover).toHaveCSS("background-color", "rgb(16, 24, 39)");
    const image = cover.locator("img");
    await expect(image).toBeVisible();
    expect(
      (await image.boundingBox())!.width / (await image.boundingBox())!.height,
    ).toBeCloseTo(2.6, 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("main > section")).toHaveCount(6);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  }
  const pdf = await page.request.get(
    "/brand-kits/quality-engineering/quality-engineering-guidelines.pdf",
  );
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  const zip = await page.request.get(
    "/brand-kits/quality-engineering/quality-engineering-kit.zip",
  );
  expect(zip.status()).toBe(200);
  expect((await zip.body()).subarray(0, 2).toString()).toBe("PK");
  await page.goto("/");
  await expect(page.locator(".identity-carousel a")).toHaveCount(0);
});

test("identity cards magnify at the rail centre and reverse without changing layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rail = page.locator(".identity-viewport");
  await rail.scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Pause logo carousel", exact: true })
    .click();
  const originals = page.locator("[data-original] .identity-card");
  const centre = originals.nth(2);
  const scale = () =>
    centre
      .locator(".identity-card-surface")
      .evaluate((el) => parseFloat(getComputedStyle(el).scale));
  const originalWidth = await centre.evaluate(
    (el) => el.getBoundingClientRect().width,
  );
  await expect.poll(scale).toBeGreaterThan(1.06);
  expect(
    await originals
      .first()
      .locator(".identity-card-surface")
      .evaluate((el) => parseFloat(getComputedStyle(el).scale)),
  ).toBeLessThan(0.94);
  const start = await rail.evaluate((el) => el.scrollLeft);
  await rail.evaluate((el, width) => {
    el.scrollLeft += 2 * (width + 20);
  }, originalWidth);
  await expect.poll(scale).toBeLessThan(0.94);
  expect(
    await centre.evaluate((el) => el.getBoundingClientRect().width),
  ).toBeCloseTo(originalWidth, 2);
  await rail.evaluate((el, x) => {
    el.scrollLeft = x;
  }, start);
  await expect.poll(scale).toBeGreaterThan(1.06);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))),
      ),
  );
  await rail.evaluate((el) => {
    const card = el.querySelector(
      "[data-original] .identity-card:nth-child(3)",
    )!;
    el.scrollLeft +=
      card.getBoundingClientRect().left -
      el.getBoundingClientRect().left +
      card.getBoundingClientRect().width / 2 -
      el.clientWidth / 2;
  });
  await expect.poll(scale).toBeGreaterThan(1.06);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const surface = (await centre
      .locator(".identity-card-surface")
      .boundingBox())!,
    viewport = (await rail.boundingBox())!;
  expect(surface.y).toBeGreaterThanOrEqual(viewport.y);
  expect(surface.y + surface.height).toBeLessThanOrEqual(
    viewport.y + viewport.height + 1,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(centre.locator(".identity-card-surface")).toHaveCSS(
    "scale",
    "none",
  );
  await expect(page.locator(".identity-carousel a")).toHaveCount(0);
});

test("both portfolio stacks magnify on entry, reverse, and keep their sticky anchors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  for (const section of ["#work", "#applications"]) {
    const card = page.locator(`${section} .project-panel`).first();
    const top = await card.evaluate(
      (el) => el.getBoundingClientRect().top + scrollY,
    );
    const layoutHeight = await card.evaluate(
      (el) => (el as HTMLElement).offsetHeight,
    );
    const scale = () =>
      card.evaluate((el) => parseFloat(getComputedStyle(el).scale));
    await page.evaluate(
      (y) => scrollTo({ top: y - 900, behavior: "instant" }),
      top,
    );
    await expect.poll(scale).toBeLessThan(0.97);
    expect(await scale()).toBeGreaterThanOrEqual(0.94);
    expect((await card.boundingBox())!.y).toBeCloseTo(900, 0);
    await page.evaluate(
      (y) => scrollTo({ top: y - 766, behavior: "instant" }),
      top,
    );
    await expect.poll(scale).toBeCloseTo(0.9825, 3);
    await page.evaluate(
      (y) => scrollTo({ top: y - 532, behavior: "instant" }),
      top,
    );
    await expect.poll(scale).toBeGreaterThan(1.02);
    expect(await scale()).toBeLessThanOrEqual(1.0251);
    await page.evaluate(
      (y) => scrollTo({ top: y - 298, behavior: "instant" }),
      top,
    );
    await expect.poll(scale).toBeCloseTo(1.0125, 3);
    await page.evaluate(
      (y) => scrollTo({ top: y - 64, behavior: "instant" }),
      top,
    );
    await expect.poll(scale).toBe(1);
    expect(await card.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(
      layoutHeight,
    );
    await page.evaluate(
      (y) => scrollTo({ top: y - 532, behavior: "instant" }),
      top,
    );
    await expect.poll(scale).toBeGreaterThan(1.02);
    await page.evaluate(
      (y) => scrollTo({ top: y - 900, behavior: "instant" }),
      top,
    );
    await expect.poll(scale).toBeLessThan(0.97);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#work .project-panel").first()).toHaveCSS(
    "scale",
    "none",
  );
  await expect(page.locator("#applications .project-panel").first()).toHaveCSS(
    "scale",
    "none",
  );
});

test("logo spacing opens at the centre, compresses at the edges, and stays reversible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rail = page.locator(".identity-viewport");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveCSS("mask-image", /112px/);
  await page
    .getByRole("button", { name: "Pause logo carousel", exact: true })
    .click();
  const originals = page.locator("[data-original] .identity-card");
  const start = await rail.evaluate((el) => el.scrollLeft);
  const width = await originals
    .first()
    .evaluate((el) => el.getBoundingClientRect().width);
  const gaps = () =>
    originals.evaluateAll((cards) => {
      const boxes = cards
        .slice(0, 5)
        .map((card) =>
          card.querySelector(".identity-card-surface")!.getBoundingClientRect(),
        );
      return boxes.slice(1).map((box, i) => box.left - boxes[i].right);
    });
  await expect
    .poll(async () => {
      const g = await gaps();
      return (g[1] + g[2]) / 2 - (g[0] + g[3]) / 2;
    })
    .toBeGreaterThan(6);
  const before = await gaps();
  expect(Math.min(...before)).toBeLessThan(0);
  expect(Math.min(...before)).toBeGreaterThan(-20);
  await rail.evaluate((el, w) => {
    el.scrollLeft += w / 2 + 10;
  }, width);
  await expect
    .poll(async () => Math.abs((await gaps())[1] - before[1]))
    .toBeGreaterThan(1);
  expect(Math.min(...(await gaps()))).toBeGreaterThan(-30);
  await rail.evaluate((el, x) => {
    el.scrollLeft = x;
  }, start);
  await expect
    .poll(async () =>
      Math.max(...(await gaps()).map((gap, i) => Math.abs(gap - before[i]))),
    )
    .toBeLessThan(0.2);
  expect(
    await originals.first().evaluate((el) => el.getBoundingClientRect().width),
  ).toBeCloseTo(width, 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(originals.nth(2).locator(".identity-card-surface")).toHaveCSS(
    "translate",
    "0px",
  );
  await expect(originals.nth(2).locator(".identity-card-surface")).toHaveCSS(
    "scale",
    "none",
  );
  await expect
    .poll(async () => {
      const g = await gaps();
      return Math.max(...g) - Math.min(...g);
    })
    .toBeLessThan(0.2);
});

test("logo perspective mirrors the sides and remains square-on across the centre band", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rail = page.locator(".identity-viewport");
  await rail.scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Pause logo carousel", exact: true })
    .click();
  const cards = page.locator("[data-original] .identity-card");
  const angle = (index: number) =>
    cards
      .nth(index)
      .evaluate((el) =>
        parseFloat(
          (el as HTMLElement).style.getPropertyValue("--identity-yaw"),
        ),
      );
  await expect.poll(() => angle(0)).toBeLessThan(-12);
  await expect.poll(() => angle(4)).toBeGreaterThan(12);
  await expect.poll(() => angle(2)).toBe(0);
  // Sample actual projected corners: the inner edge is taller on each side.
  const client = await page.context().newCDPSession(page);
  const document = await client.send("DOM.getDocument");
  for (const [index, right] of [
    [1, false],
    [5, true],
  ] as const) {
    const node = await client.send("DOM.querySelector", {
      nodeId: document.root.nodeId,
      selector: `[data-original] .identity-card:nth-child(${index}) .identity-card-surface`,
    });
    const { model } = await client.send("DOM.getBoxModel", {
      nodeId: node.nodeId,
    });
    const [tlx, tly, trx, try_, brx, bry, blx, bly] = model.border;
    const leftHeight = Math.hypot(blx - tlx, bly - tly),
      rightHeight = Math.hypot(brx - trx, bry - try_);
    expect(
      right ? leftHeight - rightHeight : rightHeight - leftHeight,
    ).toBeGreaterThan(4);
  }
  const start = await rail.evaluate((el) => el.scrollLeft);
  await rail.evaluate((el) => {
    el.scrollLeft += 25;
  });
  await expect.poll(() => angle(2)).toBe(0);
  await rail.evaluate((el, x) => {
    el.scrollLeft = x + 150;
  }, start);
  await expect.poll(() => angle(2)).toBeLessThan(-1);
  await rail.evaluate((el, x) => {
    el.scrollLeft = x;
  }, start);
  await expect.poll(() => angle(2)).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cards.nth(2).locator(".identity-card-surface")).toHaveCSS(
    "transform",
    "none",
  );
  await client.detach();
});

test("final cards reach and hold the shared top anchor before their stacks release", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  for (const section of ["#work", "#applications"]) {
    const card = page.locator(`${section} .project-panel`).last();
    const top = await card.evaluate(
      (el) => el.getBoundingClientRect().top + scrollY,
    );
    for (const extra of [0, 120]) {
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        top - 64 + extra,
      );
      await expect
        .poll(async () => Math.round((await card.boundingBox())!.y))
        .toBe(64);
      await expect(card).toHaveCSS("scale", "1");
    }
    await page.evaluate(
      (y) => scrollTo({ top: y + 600, behavior: "instant" }),
      top,
    );
    await expect
      .poll(async () => (await card.boundingBox())!.y)
      .toBeLessThan(64);
  }
});

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 2048, height: 1226 },
]) {
  test(`covered cards stay behind the final surface throughout stack exit at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const section of ["#work", "#applications"]) {
      const cards = page.locator(`${section} .project-panel`);
      const last = cards.last();
      const start = await last.evaluate(
        (el) => el.getBoundingClientRect().top + scrollY,
      );
      const anchor = await last.evaluate((el) =>
        parseFloat(getComputedStyle(el).top),
      );
      for (const extra of [120, 240, 360, 480, 600, 360, 120]) {
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          start - anchor + extra,
        );
        await expect
          .poll(() =>
            cards.evaluateAll((els) => {
              const boxes = els.map((el) => el.getBoundingClientRect());
              const front = boxes[boxes.length - 1];
              return Math.max(
                ...boxes.map((box) => Math.abs(box.top - front.top)),
              );
            }),
          )
          .toBeLessThan(1);
      }
    }
  });
}
