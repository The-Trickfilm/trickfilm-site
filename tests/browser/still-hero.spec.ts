import { test, expect } from "@playwright/test";
for (const size of [
  { width: 1672, height: 941 },
  { width: 390, height: 844 },
]) {
  test(`still lenses assemble before hero exits ${size.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    const videos: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes(".mp4")) videos.push(r.url());
    });
    await page.goto("/");
    const scene = page.locator(".mountain");
    await expect(scene).toHaveAttribute("data-ready", "true");
    const start = (await scene.boundingBox())!;
    const path = scene.locator("path").first();
    const transform = await path.getAttribute("transform");
    await expect.poll(() => path.getAttribute("transform")).not.toBe(transform);
    await page.getByRole("button", { name: "Pause motion" }).click();
    const frozen = await path.getAttribute("transform");
    await page.waitForTimeout(150);
    expect(await path.getAttribute("transform")).toBe(frozen);
    const travel = Math.min(size.height * 0.65, 600);
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      travel / 2,
    );
    await expect
      .poll(async () =>
        Math.abs(Number(await scene.getAttribute("data-progress")) - 0.5),
      )
      .toBeLessThan(0.005);
    expect((await scene.boundingBox())!.y).toBeCloseTo(start.y, 0);
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      Math.ceil(travel),
    );
    await expect(scene).toHaveAttribute("data-progress", "1.000");
    expect((await scene.boundingBox())!.y).toBeCloseTo(start.y, 0);
    expect(
      (await page.locator("#work").boundingBox())!.y,
    ).toBeGreaterThanOrEqual(size.height - 1);
    await page.screenshot({
      path: `/workspace/work/still-assembled-${size.width}.png`,
    });
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      travel + size.height * 0.15 + 150,
    );
    expect((await scene.boundingBox())!.y).toBeCloseTo(start.y - 150, 0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(scene).toHaveAttribute("data-progress", "0.000");
    expect(videos).toEqual([]);
    await page.screenshot({
      path: `/workspace/work/still-rest-${size.width}.png`,
    });
  });
}
