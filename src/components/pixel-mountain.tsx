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
      mask = document.createElement("canvas"),
      reveal = document.createElement("canvas");
    const sc = sharp.getContext("2d")!,
      mc = mask.getContext("2d")!,
      rc = reveal.getContext("2d")!;
    let maskPixels: ImageData, seeds: Float32Array;
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
        // A small binary mask makes six-CSS-pixel cells crisp at every viewport.
        mask.width = Math.ceil(bounds.width / 6);
        mask.height = Math.ceil(bounds.height / 6);
        reveal.width = w;
        reveal.height = h;
        maskPixels = mc.createImageData(mask.width, mask.height);
        seeds = new Float32Array(mask.width * mask.height);
        for (let i = 0; i < seeds.length; i++) {
          seeds[i] = tileSeed(i % mask.width, Math.floor(i / mask.width));
          maskPixels.data.set([255, 255, 255, 0], i * 4);
        }
      }
      ctx!.fillStyle = "#152c24";
      ctx!.fillRect(0, 0, w, h);
      if (elapsed >= 2.2) {
        ctx!.drawImage(sharp, 0, 0);
      } else {
        for (let i = 0; i < seeds.length; i++)
          maskPixels.data[i * 4 + 3] = tileClarity(elapsed, seeds[i]) ? 255 : 0;
        mc.putImageData(maskPixels, 0, 0);
        rc.clearRect(0, 0, w, h);
        rc.imageSmoothingEnabled = false;
        rc.drawImage(mask, 0, 0, w, h);
        rc.globalCompositeOperation = "source-in";
        rc.drawImage(sharp, 0, 0);
        rc.globalCompositeOperation = "source-over";
        ctx!.drawImage(reveal, 0, 0);
      }
      el.style.opacity = "1";
      root.dataset.phase = elapsed >= 2.2 ? "clear" : "resolving";
      if (elapsed < 2.2) id = requestAnimationFrame(paint);
    }
    function restart() {
      cancelAnimationFrame(id);
      setAvailable(!media.matches);
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
