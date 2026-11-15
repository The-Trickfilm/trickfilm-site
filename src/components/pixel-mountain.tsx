"use client";
import { useEffect, useRef, useState } from "react";
import { STILL_IMAGE } from "@/lib/still-image";
import { tileClarity, tileSeed } from "@/lib/pixel-reveal";

export function PixelMountain() {
  const canvas = useRef<HTMLCanvasElement>(null),
    host = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const el = canvas.current!,
      root = host.current!,
      ctx = el.getContext("2d", { alpha: false });
    if (!ctx) return;
    const photo = new Image(),
      media = matchMedia("(prefers-reduced-motion: reduce)");
    const sharp = document.createElement("canvas"),
      coarse = document.createElement("canvas");
    const sc = sharp.getContext("2d")!,
      cc = coarse.getContext("2d")!;
    const variants = [5, 12, 22].map((step) => ({
      step,
      canvas: document.createElement("canvas"),
    }));
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
      if (now - last < 42) {
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
        sc.filter = "grayscale(1) contrast(1.15)";
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
        sc.fillStyle = "#6dc9bb";
        sc.fillRect(0, 0, w, h);
        sc.globalCompositeOperation = "source-over";
        coarse.width = Math.max(1, Math.round(w / 30));
        coarse.height = Math.max(1, Math.round(h / 30));
        cc.drawImage(sharp, 0, 0, coarse.width, coarse.height);
        variants.forEach(({ step, canvas: layer }) => {
          layer.width = Math.max(1, Math.round(w / step));
          layer.height = Math.max(1, Math.round(h / step));
          layer
            .getContext("2d")!
            .drawImage(sharp, 0, 0, layer.width, layer.height);
        });
      }
      ctx!.imageSmoothingEnabled = false;
      ctx!.drawImage(coarse, 0, 0, w, h);
      const cell = w / Math.ceil(bounds.width / 44);
      for (let row = 0; row < Math.ceil(h / cell); row++)
        for (let col = 0; col < Math.ceil(w / cell); col++) {
          const x = col * cell,
            y = row * cell,
            tw = Math.min(cell, w - x),
            th = Math.min(cell, h - y),
            level = tileClarity(elapsed, tileSeed(col, row));
          if (level === 1) {
            ctx!.drawImage(sharp, x, y, tw, th, x, y, tw, th);
          } else if (level > 0) {
            const layer =
              variants[level > 0.5 ? 0 : level > 0.2 ? 1 : 2].canvas;
            ctx!.drawImage(
              layer,
              (x * layer.width) / w,
              (y * layer.height) / h,
              (tw * layer.width) / w,
              (th * layer.height) / h,
              x,
              y,
              tw,
              th,
            );
          }
        }
      el.style.opacity = "1";
      root.dataset.phase = elapsed >= 2.2 ? "clear" : "resolving";
      if (elapsed < 2.2) id = requestAnimationFrame(paint);
    }
    function restart() {
      cancelAnimationFrame(id);
      start = 0;
      last = 0;
      id = requestAnimationFrame(paint);
    }
    replay.current = restart;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && loaded) {
        if (elapsed < 2.2) start = performance.now() - elapsed * 1000;
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
