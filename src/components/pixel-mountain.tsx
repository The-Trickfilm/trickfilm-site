"use client";
import { useEffect, useRef, useState } from "react";
import { STILL_IMAGE } from "@/lib/still-image";
import {
  REVEAL_DURATION,
  CLARITY_DURATION,
  HERO_DURATION,
} from "@/lib/pixel-reveal";
import { createPixelField } from "@/lib/pixel-field";
export function PixelMountain() {
  const canvas = useRef<HTMLCanvasElement>(null),
    host = useRef<HTMLDivElement>(null),
    replay = useRef<(() => void) | null>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const el = canvas.current!,
      root = host.current!,
      hero = root.closest<HTMLElement>(".hero")!;
    const photo = new Image(),
      media = matchMedia("(prefers-reduced-motion: reduce)");
    let field: ReturnType<typeof createPixelField> = null;
    let id = 0,
      start = 0,
      elapsed = 0,
      last = 0,
      visible = true,
      loaded = false,
      disposed = false;
    function paint(now: number) {
      if (disposed || !loaded || !visible || document.hidden) return;
      if (now - last < 15) {
        id = requestAnimationFrame(paint);
        return;
      }
      if (!start) start = now;
      elapsed = media.matches ? HERO_DURATION : (now - start) / 1000;
      last = now;
      const done = elapsed >= HERO_DURATION;
      const bounds = root.getBoundingClientRect(),
        width = Math.min(
          done ? 2400 : 1600,
          Math.round(bounds.width * Math.min(devicePixelRatio, done ? 2 : 1.5)),
        ),
        height = Math.round((width * bounds.height) / bounds.width);
      if (!width || !height) return;
      const linear = media.matches
        ? 1
        : Math.max(
            0,
            Math.min(1, (elapsed - REVEAL_DURATION) / CLARITY_DURATION),
          );
      const resolve = linear * linear * (3 - 2 * linear);
      field?.render({
        width,
        height,
        cssWidth: bounds.width,
        cssHeight: bounds.height,
        time: Math.min(elapsed, HERO_DURATION),
        intro: Math.min(1, elapsed / REVEAL_DURATION),
        resolve,
        reduced: media.matches,
        pointer: [0.5, 0.5, 0],
      });
      el.style.opacity = "1";
      root.dataset.phase = done ? "clear" : "resolving";
      if (done) hero.dataset.intro = "clear";
      if (!done) id = requestAnimationFrame(paint);
    }
    function renderFrame() {
      cancelAnimationFrame(id);
      last = 0;
      id = requestAnimationFrame(paint);
    }
    function restart() {
      start = 0;
      elapsed = 0;
      hero.dataset.intro = media.matches ? "clear" : "revealing";
      setAvailable(!media.matches);
      renderFrame();
    }
    replay.current = restart;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && loaded) {
        start = performance.now() - elapsed * 1000;
        renderFrame();
      }
    });
    observer.observe(root);
    const resize = new ResizeObserver(renderFrame);
    resize.observe(root);
    const visibility = () => {
      if (!document.hidden) {
        start = performance.now() - elapsed * 1000;
        renderFrame();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", restart);
    const fallback = () => {
      loaded = false;
      cancelAnimationFrame(id);
      el.style.opacity = "0";
      root.dataset.phase = "fallback";
      hero.dataset.intro = "clear";
      setAvailable(false);
    };
    el.addEventListener("webglcontextlost", fallback);
    photo.onload = () => {
      field = createPixelField(el, photo);
      if (!field) {
        fallback();
        return;
      }
      loaded = true;
      restart();
    };
    photo.onerror = fallback;
    photo.src = STILL_IMAGE.src;
    return () => {
      disposed = true;
      photo.onload = null;
      photo.onerror = null;
      cancelAnimationFrame(id);
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", restart);
      el.removeEventListener("webglcontextlost", fallback);
      field?.dispose();
      replay.current = null;
    };
  }, []);
  return (
    <div
      className="pixel-mountain"
      ref={host}
      data-phase="loading"
      role="group"
      aria-label="A pixel intro resolving into a sharp, clear mountain photograph"
    >
      <noscript>
        <div className="mountain-no-script" />
      </noscript>
      <canvas ref={canvas} aria-hidden="true" />
      {available && (
        <div className="hero-motion-controls">
          <button
            className="replay-reveal"
            aria-label="Replay image focus animation"
            onClick={() => replay.current?.()}
          >
            <span aria-hidden="true">↻</span> Replay focus
          </button>
        </div>
      )}
    </div>
  );
}
