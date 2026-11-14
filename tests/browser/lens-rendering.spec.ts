import { test, expect } from "@playwright/test";
import { fragmentShader } from "../../src/lib/lens-shader.ts";
for (const explicit of [true, false])
  test(`the real shader progressively removes blur at all six overlap levels (${explicit ? "explicit" : "implicit"} LOD)`, async ({
    page,
  }) => {
    await page.goto("/");
    const contrast = await page.evaluate(
      (shader) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 512;
        const gl = canvas.getContext("webgl", {
          preserveDrawingBuffer: true,
          alpha: false,
        })!;
        const ext =
          shader.preferExplicit && !!gl.getExtension("EXT_shader_texture_lod");
        const compile = (type: number, source: string) => {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, source);
          gl.compileShader(s);
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
            throw Error(gl.getShaderInfoLog(s)!);
          return s;
        };
        const p = gl.createProgram()!;
        gl.attachShader(
          p,
          compile(
            gl.VERTEX_SHADER,
            "attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}",
          ),
        );
        gl.attachShader(
          p,
          compile(gl.FRAGMENT_SHADER, ext ? shader.explicit : shader.implicit),
        );
        gl.linkProgram(p);
        gl.useProgram(p);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          gl.STATIC_DRAW,
        );
        const pos = gl.getAttribLocation(p, "position");
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const pixels = new Uint8Array(1024 * 1024 * 4);
        for (let y = 0; y < 1024; y++)
          for (let x = 0; x < 1024; x++) {
            const v = (Math.floor(x / 64) + Math.floor(y / 64)) % 2 ? 224 : 32;
            const at = (y * 1024 + x) * 4;
            pixels[at] = pixels[at + 1] = pixels[at + 2] = v;
            pixels[at + 3] = 255;
          }
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1024,
          1024,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels,
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        for (const [name, x, y] of [
          ["resolution", 512, 512],
          ["source", 512, 512],
          ["texel", 1 / 1024, 1 / 1024],
          ["summit", 0.53, 0.52],
          ["focus", 0.53, 0.52],
        ] as const)
          gl.uniform2f(gl.getUniformLocation(p, name), x, y);
        const values: number[] = [];
        for (let count = 0; count <= 5; count++) {
          const circles = Array.from({ length: 5 }, (_, i) =>
            i < count ? [256, 256, 230] : [0, 0, 0],
          ).flat();
          gl.uniform3fv(
            gl.getUniformLocation(p, "circles[0]"),
            new Float32Array(circles),
          );
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          const output = new Uint8Array(128 * 128 * 4);
          gl.readPixels(192, 192, 128, 128, gl.RGBA, gl.UNSIGNED_BYTE, output);
          let sum = 0,
            squared = 0;
          for (let i = 0; i < output.length; i += 4) {
            sum += output[i];
            squared += output[i] ** 2;
          }
          const n = output.length / 4;
          values.push(Math.sqrt(squared / n - (sum / n) ** 2));
        }
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return values;
      },
      {
        preferExplicit: explicit,
        explicit: fragmentShader(true),
        implicit: fragmentShader(false),
      },
    );
    console.log("Measured image contrast for overlap counts 0–5:", contrast);
    expect(contrast[0]).toBeLessThan(contrast[5] * 0.2);
    for (let i = 0; i <= 5; i++)
      expect(
        Math.abs(
          (contrast[i] - contrast[0]) / (contrast[5] - contrast[0]) - i / 5,
        ),
      ).toBeLessThan(0.03);
    for (let i = 0; i < 5; i++)
      expect(contrast[i + 1]).toBeGreaterThan(contrast[i]);
  });
