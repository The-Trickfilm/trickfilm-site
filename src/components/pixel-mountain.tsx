"use client";
import { useEffect, useRef, useState } from "react";
import { STILL_IMAGE } from "@/lib/still-image";
import { REVEAL_DURATION } from "@/lib/pixel-reveal";
import { createPixelField } from "@/lib/pixel-field";

export function PixelMountain() {
  const canvas = useRef<HTMLCanvasElement>(null),
    host = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const [available, setAvailable] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const pauseMotion = useRef<((paused: boolean) => void) | null>(null);
  useEffect(() => {
    const el = canvas.current!,
      root = host.current!,
      hero = root.closest<HTMLElement>(".hero")!;
    const photo = new Image(),
      media = matchMedia("(prefers-reduced-motion: reduce)");
    let field: ReturnType<typeof createPixelField> = null;
    const pointer = [0.5, 0.5, 0],
      target = [0.5, 0.5, 0];
    let id = 0,
      start = 0,
      elapsed = 0,
      last = 0,
      visible = true,
      loaded = false,
      disposed = false,
      forceRender = false;
    function paint(now: number) {
      if (
        disposed ||
        !loaded ||
        (pausedRef.current && !media.matches && !forceRender)
      )
        return;
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      if (!forceRender && now - last < 15) {
        id = requestAnimationFrame(paint);
        return;
      }
      if (!start) start = now;
      elapsed = media.matches
        ? 3
        : pausedRef.current
          ? elapsed
          : (now - start) / 1000;
      forceRender = false;
      last = now;
      const bounds = root.getBoundingClientRect(),
        w = Math.min(
          1600,
          Math.round(bounds.width * Math.min(devicePixelRatio, 1.5)),
        ),
        h = Math.round((w * bounds.height) / bounds.width);
      if (!w || !h) return;
      for (let i = 0; i < 3; i++)
        pointer[i] += (target[i] - pointer[i]) * 0.075;
      field?.render({
        width: w,
        height: h,
        cssWidth: bounds.width,
        cssHeight: bounds.height,
        time: elapsed,
        intro: Math.min(1, elapsed / REVEAL_DURATION),
        reduced: media.matches,
        pointer,
      });
      if (elapsed >= REVEAL_DURATION) hero.dataset.intro = "clear";
      el.style.opacity = "1";
      root.dataset.phase = elapsed >= REVEAL_DURATION ? "clear" : "resolving";
      if (!media.matches && !pausedRef.current)
        id = requestAnimationFrame(paint);
    }
    function restart() {
      cancelAnimationFrame(id);
      pausedRef.current = false;
      setPaused(false);
      setAvailable(!media.matches);
      hero.dataset.intro = media.matches ? "clear" : "revealing";
      start = 0;
      last = 0;
      id = requestAnimationFrame(paint);
    }
    replay.current = restart;
    pauseMotion.current = (next) => {
      pausedRef.current = next;
      if (next) cancelAnimationFrame(id);
      else {
        start = performance.now() - elapsed * 1000;
        restartFrame();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && loaded) {
        start = performance.now() - elapsed * 1000;
        restartFrame();
      }
    });
    function restartFrame() {
      cancelAnimationFrame(id);
      last = 0;
      id = requestAnimationFrame(paint);
    }
    const visibility = () => {
      if (!document.hidden) {
        start = performance.now() - elapsed * 1000;
        restartFrame();
      }
    };
    const resize = new ResizeObserver(() => {
      forceRender = true;
      restartFrame();
    });
    resize.observe(root);
    observer.observe(root);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", restart);
    photo.onload = () => {
      field = createPixelField(el, photo);
      if (!field) {
        hero.dataset.intro = "clear";
        root.dataset.phase = "fallback";
        return;
      }
      loaded = true;
      setAvailable(!media.matches);
      restart();
    };
    photo.onerror = () => {
      hero.dataset.intro = "clear";
      root.dataset.phase = "fallback";
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      target[0] = (event.clientX - r.left) / r.width;
      target[1] = (event.clientY - r.top) / r.height;
      target[2] = 1;
    };
    const leave = () => {
      target[2] = 0;
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    const lost = () => {
      loaded = false;
      cancelAnimationFrame(id);
      el.style.opacity = "0";
      root.dataset.phase = "fallback";
      hero.dataset.intro = "clear";
      setAvailable(false);
    };
    el.addEventListener("webglcontextlost", lost);
    photo.src = STILL_IMAGE.src;
    return () => {
      disposed = true;
      photo.onload = null;
      cancelAnimationFrame(id);
      observer.disconnect();
      resize.disconnect();
      replay.current = null;
      pauseMotion.current = null;
      el.removeEventListener("webglcontextlost", lost);
      field?.dispose();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", restart);
    };
  }, []);
  return (
    <div
      className="pixel-mountain"
      ref={host}
      data-phase="loading"
      role="group"
      aria-label="A mountain constructed from a flowing field of turquoise pixels"
    >
      <noscript>
        <div className="mountain-no-script" />
      </noscript>
      <canvas ref={canvas} aria-hidden="true" />
      {available && (
        <div className="hero-motion-controls">
          <button
            className="replay-reveal"
            onClick={() => replay.current?.()}
            aria-label="Replay image focus animation"
          >
            <span aria-hidden="true">↻</span> Replay focus
          </button>
          <button
            className="replay-reveal"
            aria-pressed={paused}
            onClick={() => {
              const next = !paused;
              pauseMotion.current?.(next);
              setPaused(next);
            }}
          >
            {paused ? "Play hero motion" : "Pause hero motion"}
          </button>
        </div>
      )}
    </div>
  );
}
