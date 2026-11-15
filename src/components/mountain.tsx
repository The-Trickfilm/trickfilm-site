"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useId,
} from "react";
import {
  convergence,
  lensGeometry,
  lensApertures,
  focusCenter,
} from "@/lib/lenses";

import { STILL_IMAGE } from "@/lib/still-image";
import { lensArtwork } from "@/lib/lens-artwork";

import { fragmentShader } from "@/lib/lens-shader";
const subscribeMotion = (callback: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function Mountain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const outlineSvg = useRef<SVGSVGElement>(null);
  const outlinePaths = useRef<(SVGPathElement | null)[]>([]);
  const gradientId = `trickfilm-lens-${useId().replaceAll(":", "")}`;
  const region = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const pauseRef = useRef(false);
  useEffect(() => {
    const el = canvas.current!,
      host = region.current!;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 1000px)").matches;
    const gl = el.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    const shader = (type: number, text: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, text);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = shader(
      gl.VERTEX_SHADER,
      "attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}",
    );
    // One still texture supplies every overlap level; the blur pyramid is generated once.
    const staging = document.createElement("canvas");
    staging.width = mobile ? 1024 : 2048;
    staging.height = staging.width / 2;
    const stage = staging.getContext("2d", { alpha: false });
    if (!stage) return;
    const explicitLod = !!gl.getExtension("EXT_shader_texture_lod");
    const fs = shader(gl.FRAGMENT_SHADER, fragmentShader(explicitLod));
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const attribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const uniforms = Object.fromEntries(
      ["resolution", "source", "texel", "summit", "focus", "circles[0]"].map(
        (n) => [n, gl.getUniformLocation(program, n)],
      ),
    );

    const photo = new Image();
    photo.src = STILL_IMAGE.src;
    let ready = false,
      visible = true,
      disposed = false,
      id = 0,
      last = 0,
      motionTime = 0,
      previousRender = "";
    photo.onload = () => {
      stage.drawImage(photo, 0, 0, staging.width, staging.height);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        staging,
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      ready = true;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
    });
    observer.observe(host);
    const visibility = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", visibility);
    const contextLost = () => {
      ready = false;
      el.style.opacity = "0";
      host.dataset.ready = "false";
    };
    el.addEventListener("webglcontextlost", contextLost);
    const draw = (now: number) => {
      if (disposed) return;
      id = requestAnimationFrame(draw);
      if (
        !ready ||
        !visible ||
        document.hidden ||
        gl.isContextLost() ||
        now - last < 33
      )
        return;
      const elapsed = last ? (now - last) / 1000 : 0;
      last = now;
      if (!pauseRef.current && !media.matches) motionTime += elapsed;
      const rect = host.getBoundingClientRect();
      const w = Math.min(
          mobile ? 640 : 1280,
          Math.round(rect.width * Math.min(devicePixelRatio || 1, 1.5)),
        ),
        h = Math.round((w * rect.height) / rect.width);
      if (!w || !h) return;
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
        gl.viewport(0, 0, w, h);
        outlineSvg.current?.setAttribute("viewBox", `0 0 ${w} ${h}`);
      }
      const section = host.closest(".hero-scroll")!.getBoundingClientRect();
      const headerHeight =
        document.querySelector(".header")?.getBoundingClientRect().height ?? 0;
      const progress = media.matches
        ? 1
        : convergence(section.top, h, innerHeight, headerHeight);
      const renderKey = `${w},${h},${progress},${motionTime}`;
      if (renderKey === previousRender) return;
      previousRender = renderKey;
      const circles = lensGeometry(w, h, progress, motionTime);
      const apertures = lensApertures(circles);
      circles.forEach(([x, y, radius], i) => {
        const art = lensArtwork[i],
          scale = radius / (art.width / 2);
        const path = outlinePaths.current[i];
        path?.setAttribute("opacity", String(1 - progress * 0.78));
        path?.setAttribute(
          "transform",
          `translate(${x - (art.width / 2) * scale} ${y - (art.height / 2) * scale}) scale(${scale})`,
        );
      });
      const anchor = focusCenter(w, h);
      gl.uniform2f(uniforms.resolution, w, h);
      gl.uniform2f(uniforms.source, photo.naturalWidth, photo.naturalHeight);
      gl.uniform2f(uniforms.texel, 1 / staging.width, 1 / staging.height);
      gl.uniform2f(
        uniforms.summit,
        STILL_IMAGE.summit[0],
        STILL_IMAGE.summit[1],
      );
      gl.uniform2f(uniforms.focus, anchor[0], anchor[1]);
      gl.uniform3fv(uniforms["circles[0]"], new Float32Array(apertures.flat()));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      el.style.opacity = "1";
      host.dataset.ready = "true";
      host.dataset.progress = progress.toFixed(3);
      host.dataset.medium = "still";
    };
    id = requestAnimationFrame(draw);
    return () => {
      disposed = true;
      photo.onload = null;
      cancelAnimationFrame(id);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      el.removeEventListener("webglcontextlost", contextLost);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);
  return (
    <div
      className="mountain"
      ref={region}
      role="group"
      aria-label="A still mountain photograph coming into focus through five overlapping lenses"
    >
      <canvas ref={canvas} aria-hidden="true" />
      <svg
        ref={outlineSvg}
        className="lens-outlines"
        viewBox="0 0 445 435"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {lensArtwork.map((art, i) => (
            <radialGradient
              key={art.name}
              id={`${gradientId}-${i}`}
              gradientUnits="userSpaceOnUse"
              cx={art.width / 2}
              cy={art.height / 2}
              r={art.width / 2}
              fx={art.aperture.x}
              fy={art.aperture.y}
              fr={art.aperture.radius}
            >
              <stop offset="0" stopColor="white" stopOpacity="0.05" />
              <stop offset="0.96" stopColor="white" stopOpacity="0.05" />
              <stop offset="1" stopColor="white" stopOpacity="0.20" />
            </radialGradient>
          ))}
        </defs>
        {lensArtwork.map((art, i) => (
          <path
            key={art.name}
            data-lens={art.name}
            ref={(node) => {
              outlinePaths.current[i] = node;
            }}
            d={art.path}
            fill={`url(#${gradientId}-${i})`}
          />
        ))}
      </svg>
      {!reduced && (
        <button
          className="motion-control"
          aria-pressed={paused}
          onClick={() => {
            const next = !paused;
            pauseRef.current = next;
            setPaused(next);
          }}
        >
          {paused ? "Play motion" : "Pause motion"}
        </button>
      )}
      <span className="image-label">
        A different lens. A clearer perspective.
      </span>
    </div>
  );
}
