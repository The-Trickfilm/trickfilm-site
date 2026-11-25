"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ProjectFrame } from "@/lib/projects";

function subscribeMotion(callback: () => void) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverReduced = () => true;

function AnimatedScreen({
  src,
  poster,
  playing,
}: {
  src: string;
  poster: string;
  playing: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current!;
    if (playing)
      void element.play().catch(() => {
        /* Keep the poster when autoplay is unavailable. */
      });
    else element.pause();
    return () => element.pause();
  }, [playing]);
  return (
    <video
      ref={video}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="preview-video"
    />
  );
}

export function ScreenSlideshow({
  frames,
  name,
  priority = false,
  intervalMs = 3000,
  darkBackground = false,
}: {
  frames: readonly ProjectFrame[];
  name: string;
  priority?: boolean;
  intervalMs?: number;
  darkBackground?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false),
    [visible, setVisible] = useState(false),
    [hidden, setHidden] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    reduced,
    serverReduced,
  );
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(root.current!);
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (frames.length < 2 || paused || !visible || hidden || reducedMotion)
      return;
    const interval = setInterval(
      () => setActive((i) => (i + 1) % frames.length),
      intervalMs,
    );
    return () => clearInterval(interval);
  }, [paused, visible, hidden, reducedMotion, frames.length, intervalMs]);
  return (
    <div
      ref={root}
      className="screen-slideshow"
      role="group"
      aria-label={`${name} artwork preview`}
    >
      <div
        className={`laptop-display diagram-display${darkBackground ? " presentation-display" : ""}`}
      >
        {frames.map((frame, i) => (
          <span
            key={frame.src}
            className="preview-frame"
            data-preview-active={active === i}
            aria-hidden={active !== i}
          >
            <Image
              src={frame.src}
              width={frame.width}
              height={frame.height}
              alt={frame.alt}
              sizes="(max-width: 700px) 82vw, 58vw"
              priority={priority && i === 0}
              loading={
                priority && i === 0 ? undefined : visible ? "eager" : "lazy"
              }
            />
            {active === i && frame.videoSrc && visible && !reducedMotion && (
              <AnimatedScreen
                src={frame.videoSrc}
                poster={frame.src}
                playing={!paused && !hidden}
              />
            )}
          </span>
        ))}
      </div>
      {(frames.length > 1 || !reducedMotion) && (
        <div className="preview-controls">
          {frames.length > 1 && (
            <span aria-live={paused || reducedMotion ? "polite" : "off"}>
              {active + 1} / {frames.length}
            </span>
          )}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={`${paused ? "Play" : "Pause"} ${name} preview`}
            >
              {paused ? "Play" : "Pause"}
            </button>
          )}
          {frames.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                setActive((i) => (i + 1) % frames.length);
              }}
              aria-label={`Next ${name} image`}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
