"use client";
import { useEffect, useRef, useState } from "react";
import { STILL_IMAGE } from "@/lib/still-image";
import {
  revealPixel,
  revealDistance,
  REVEAL_DURATION,
  tileSeed,
} from "@/lib/pixel-reveal";

export function PixelMountain() {
  const canvas = useRef<HTMLCanvasElement>(null),
    host = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const el = canvas.current!,
      root = host.current!,
      ctx = el.getContext("2d", { alpha: false });
    const hero = root.closest<HTMLElement>(".hero")!;
    if (!ctx) {
      hero.dataset.intro = "clear";
      root.dataset.phase = "fallback";
      return;
    }
    const photo = new Image(),
      media = matchMedia("(prefers-reduced-motion: reduce)");
    const sharp = document.createElement("canvas"),
      mask = document.createElement("canvas");
    const sc = sharp.getContext("2d")!,
      mc = mask.getContext("2d")!;
    let maskPixels: ImageData, seeds: Float32Array, distances: Float32Array;
    let id = 0,
      start = 0,
      elapsed = 0,
      last = 0,
      visible = true,
      loaded = false,
      disposed = false;
    function paint(now: number) {
      if (disposed || !loaded) return;
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      if (now - last < 15) {
        id = requestAnimationFrame(paint);
        return;
      }
      if (!start) start = now;
      elapsed = media.matches ? 3 : (now - start) / 1000;
      last = now;
      const bounds = root.getBoundingClientRect(),
        w = Math.min(
          1600,
          Math.round(bounds.width * Math.min(devicePixelRatio, 1.5)),
        ),
        h = Math.round((w * bounds.height) / bounds.width);
      if (!w || !h) return;
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
        sharp.width = w;
        sharp.height = h;
        const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight),
          sw = w / scale,
          sh = h / scale;
        sc.filter = "grayscale(1) contrast(1.2)";
        sc.drawImage(
          photo,
          (photo.naturalWidth - sw) * 0.58,
          (photo.naturalHeight - sh) * 0.3,
          sw,
          sh,
          0,
          0,
          w,
          h,
        );
        sc.filter = "none";
        sc.globalCompositeOperation = "multiply";
        sc.fillStyle = "#1f8875";
        sc.fillRect(0, 0, w, h);
        sc.globalCompositeOperation = "source-over";
        // A small binary mask makes six-CSS-pixel cells crisp at every viewport.
        mask.width = Math.ceil(bounds.width / 6);
        mask.height = Math.ceil(bounds.height / 6);

        maskPixels = mc.createImageData(mask.width, mask.height);
        seeds = new Float32Array(mask.width * mask.height);
        distances = new Float32Array(seeds.length);
        for (let i = 0; i < seeds.length; i++) {
          seeds[i] = tileSeed(i % mask.width, Math.floor(i / mask.width));
          distances[i] = revealDistance(
            ((i % mask.width) + 0.5) / mask.width,
            (Math.floor(i / mask.width) + 0.5) / mask.height,
          );
          maskPixels.data.set([0, 0, 0, 255], i * 4);
        }
      }
      ctx!.imageSmoothingEnabled = true;
      const progress = Math.min(1, elapsed / REVEAL_DURATION);
      const scale = 1 + 0.035 * Math.pow(1 - progress, 3);
      ctx!.drawImage(
        sharp,
        (w - w * scale) * 0.52,
        (h - h * scale) * 0.47,
        w * scale,
        h * scale,
      );
      if (elapsed < REVEAL_DURATION) {
        for (let i = 0; i < seeds.length; i++)
          maskPixels.data[i * 4 + 3] = revealPixel(
            elapsed,
            distances[i],
            seeds[i],
          )
            ? 0
            : 255;
        mc.putImageData(maskPixels, 0, 0);
        ctx!.imageSmoothingEnabled = false;
        ctx!.drawImage(mask, 0, 0, w, h);
      }
      if (elapsed >= REVEAL_DURATION) hero.dataset.intro = "clear";
      el.style.opacity = "1";
      root.dataset.phase = elapsed >= REVEAL_DURATION ? "clear" : "resolving";
      if (elapsed < REVEAL_DURATION) id = requestAnimationFrame(paint);
    }
    function restart() {
      cancelAnimationFrame(id);
      setAvailable(!media.matches);
      hero.dataset.intro = media.matches ? "clear" : "revealing";
      start = 0;
      last = 0;
      id = requestAnimationFrame(paint);
    }
    replay.current = restart;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && loaded) {
        if (elapsed < REVEAL_DURATION)
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
      el.width = 0;
      restartFrame();
    });
    resize.observe(root);
    observer.observe(root);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", restart);
    photo.onload = () => {
      loaded = true;
      setAvailable(!media.matches);
      restart();
    };
    photo.onerror = () => {
      hero.dataset.intro = "clear";
      root.dataset.phase = "fallback";
    };
    photo.src = STILL_IMAGE.src;
    return () => {
      disposed = true;
      photo.onload = null;
      cancelAnimationFrame(id);
      observer.disconnect();
      resize.disconnect();
      replay.current = null;
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
      aria-label="A pixelated mountain photograph resolving into a clear turquoise landscape"
    >
      <noscript>
        <div className="mountain-no-script" />
      </noscript>
      <canvas ref={canvas} aria-hidden="true" />
      {available && (
        <button
          className="replay-reveal"
          onClick={() => replay.current?.()}
          aria-label="Replay image focus animation"
        >
          <span aria-hidden="true">↻</span> Replay focus
        </button>
      )}
    </div>
  );
}
