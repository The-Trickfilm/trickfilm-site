import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import ts from "typescript";
const layout = ts.transpileModule(
  readFileSync("src/lib/pixel-reveal.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext } },
).outputText;
const layoutUrl = `data:text/javascript;base64,${Buffer.from(layout).toString("base64")}`;
const source = readFileSync("src/lib/pixel-field.ts", "utf8").replace(
  '"./pixel-reveal"',
  JSON.stringify(layoutUrl),
);
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
test("the GPU constructs separated micro-squares and moves their geometry over time", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(
    async (moduleUrl) => {
      const { createPixelField } = await import(moduleUrl);
      const imageCanvas = document.createElement("canvas");
      imageCanvas.width = 64;
      imageCanvas.height = 64;
      const ctx = imageCanvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 64, 64);
      const photo = new Image();
      photo.src = imageCanvas.toDataURL();
      await photo.decode();
      const canvas = document.createElement("canvas");
      const field = createPixelField(canvas, photo);
      if (!field) throw new Error("WebGL field failed to compile");
      const args = {
        width: 640,
        height: 360,
        cssWidth: 640,
        cssHeight: 360,
        time: 2,
        intro: 1,
        reduced: false,
        pointer: [0.5, 0.5, 0],
      };
      const read = () => {
        const gl = canvas.getContext("webgl")!;
        const pixels = new Uint8Array(640 * 360 * 4);
        gl.readPixels(0, 0, 640, 360, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return pixels;
      };
      field.render({ ...args, intro: 0 });
      const black = read();
      field.render(args);
      const a = read();
      field.render({ ...args, time: 5 });
      const b = read();
      let occupied = 0,
        changed = 0;
      for (let i = 0; i < a.length; i += 4) {
        const aa = a[i + 1] > 3,
          bb = b[i + 1] > 3;
        if (aa) occupied++;
        if (aa !== bb) changed++;
      }
      field.render({ ...args, reduced: true });
      const still = read();
      field.render({ ...args, reduced: true, time: 10 });
      const still2 = read();
      const stable = still.every((v, i) => v === still2[i]);
      field.dispose();
      return {
        black: black.every((v, i) => i % 4 === 3 || v === 0),
        occupied: occupied / (640 * 360),
        changed: changed / (640 * 360),
        stable,
      };
    },
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`,
  );
  expect(result.black).toBe(true);
  expect(result.occupied).toBeGreaterThan(0.05);
  expect(result.occupied).toBeLessThan(0.6);
  expect(result.changed).toBeGreaterThan(0.1);
  expect(result.stable).toBe(true);
  console.log("Actual GPU surface coverage and moving geometry:", result);
});
