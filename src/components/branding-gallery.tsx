"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { logoProjects } from "@/lib/logo-projects";
const featured = [
  "koan",
  "xdi",
  "houndz-unleashed",
  "capture-lab",
  "langtry",
  "medium-events",
];
const identities = [
  ...logoProjects.filter((p) => featured.includes(p.image)),
  ...logoProjects.filter((p) => !featured.includes(p.image)),
];
function subscribeMotion(callback: () => void) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getReducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverReducedMotion = () => true;
export function BrandingGallery() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const period = useRef(0);
  const manualUntil = useRef(0);
  const navigationFrame = useRef(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    getReducedMotion,
    serverReducedMotion,
  );

  useEffect(() => {
    const rail = viewport.current!,
      strip = track.current!;
    strip.dataset.loopReady = "true";
    const measure = () => {
      cancelAnimationFrame(navigationFrame.current);
      const original = strip.querySelector<HTMLElement>("[data-original]")!;
      const nextPeriod =
        original.getBoundingClientRect().width +
        parseFloat(getComputedStyle(strip).gap);
      const progress = period.current
        ? (rail.scrollLeft - period.current) / period.current
        : 0;
      period.current = nextPeriod;
      rail.scrollLeft = nextPeriod * (1 + (((progress % 1) + 1) % 1));
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(rail);
    return () => {
      resize.disconnect();
      observer.disconnect();
      cancelAnimationFrame(navigationFrame.current);
    };
  }, []);

  // Cache layout centres on resize; scrolling only updates compositor scale values.
  useEffect(() => {
    const rail = viewport.current!,
      strip = track.current!;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let items: {
      card: HTMLElement;
      center: number;
      width: number;
      scale: number;
      shift: number;
    }[] = [];
    let frame = 0;
    const update = () => {
      frame = 0;
      const center = rail.scrollLeft + rail.clientWidth / 2;
      const radius = rail.clientWidth * 0.55;
      items.forEach((item) => {
        if (media.matches) {
          item.card.style.removeProperty("--identity-scale");
          item.card.style.removeProperty("--identity-shift");
          item.scale = 1;
          item.shift = 0;
          return;
        }
        const distance = Math.abs(item.center - center);
        if (distance > rail.clientWidth / 2 + item.width) return;
        const proximity = Math.max(0, 1 - distance / radius);
        const focus = proximity * proximity * (3 - 2 * proximity);
        const scale = 0.88 + focus * 0.195;
        // A monotonic projection opens the middle and compresses the periphery.
        // Move the inner surface only, keeping native scroll widths unchanged.
        const reach = Math.max(
          (rail.clientWidth - item.width) / 2,
          item.width + 20,
        );
        const spread = 0.08;
        const normalized = distance / reach;
        const projected =
          distance <= reach
            ? distance * (1 + spread * (1 - normalized * normalized))
            : reach + (distance - reach) * (1 - 2 * spread);
        const shift = Math.sign(item.center - center) * (projected - distance);
        if (Math.abs(shift - item.shift) > 0.02) {
          item.card.style.setProperty(
            "--identity-shift",
            `${shift.toFixed(3)}px`,
          );
          item.shift = shift;
        }
        if (Math.abs(scale - item.scale) > 0.0002) {
          item.card.style.setProperty("--identity-scale", scale.toFixed(4));
          item.scale = scale;
        }
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      const left = rail.getBoundingClientRect().left;
      items = Array.from(
        strip.querySelectorAll<HTMLElement>(".identity-card"),
      ).map((card) => ({
        card,
        center:
          card.getBoundingClientRect().left -
          left +
          rail.scrollLeft +
          card.offsetWidth / 2,
        width: card.offsetWidth,
        scale: -1,
        shift: Infinity,
      }));
      schedule();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    measure();
    rail.addEventListener("scroll", schedule, { passive: true });
    media.addEventListener("change", schedule);
    return () => {
      resize.disconnect();
      rail.removeEventListener("scroll", schedule);
      media.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!visible || paused || hovered || focused || reducedMotion) return;
    const rail = viewport.current!;
    let frame = 0,
      previous = 0,
      position = rail.scrollLeft;
    const tick = (time: number) => {
      if (previous && !document.hidden && time > manualUntil.current) {
        // Keep a fractional accumulator so slow motion stays smooth on high-refresh displays.
        if (Math.abs(rail.scrollLeft - position) > 4)
          position = rail.scrollLeft;
        position += Math.min(time - previous, 50) * 0.025;
        const size = period.current;
        if (size && position >= size * 2) position -= size;
        rail.scrollLeft = position;
      } else position = rail.scrollLeft;
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, paused, hovered, focused, reducedMotion]);

  function wrap() {
    const rail = viewport.current!,
      size = period.current;
    if (!size) return;
    if (rail.scrollLeft < size - 1) rail.scrollLeft += size;
    else if (rail.scrollLeft >= size * 2 - 1) rail.scrollLeft -= size;
  }
  function nudge(direction: number) {
    const rail = viewport.current!;
    manualUntil.current = performance.now() + 2500;
    const width = rail
      .querySelector<HTMLElement>(".identity-card")!
      .getBoundingClientRect().width;
    cancelAnimationFrame(navigationFrame.current);
    const start = rail.scrollLeft,
      distance = direction * (width + 20);
    const place = (value: number) => {
      const size = period.current;
      rail.scrollLeft = size
        ? size + ((((value - size) % size) + size) % size)
        : value;
    };
    if (reducedMotion) {
      place(start + distance);
      return;
    }
    const began = performance.now();
    const move = (time: number) => {
      const progress = Math.min((time - began) / 360, 1);
      place(start + distance * (1 - (1 - progress) ** 3));
      if (progress < 1) navigationFrame.current = requestAnimationFrame(move);
    };
    navigationFrame.current = requestAnimationFrame(move);
  }
  function card(project: (typeof identities)[number]) {
    return (
      <figure className="identity-card" key={project.image}>
        <div className="identity-card-surface">
          <div className="identity-image">
            <Image
              src={project.src}
              width={project.width}
              height={project.height}
              alt={`${project.name} brand identity`}
              sizes="(max-width: 700px) 42vw, (max-width: 1100px) 28vw, 18vw"
            />
          </div>
          <figcaption className="identity-caption">
            <h3>{project.name}</h3>
          </figcaption>
        </div>
      </figure>
    );
  }
  return (
    <div
      className="identity-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected logo designs"
    >
      <div
        className="identity-viewport"
        ref={viewport}
        tabIndex={0}
        role="group"
        aria-label="Scrollable brand identities"
        onScroll={wrap}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
        onPointerDown={() => {
          cancelAnimationFrame(navigationFrame.current);
          manualUntil.current = performance.now() + 3500;
        }}
        onWheel={() => {
          cancelAnimationFrame(navigationFrame.current);
          manualUntil.current = performance.now() + 3500;
        }}
      >
        <div className="identity-track" ref={track}>
          <div className="identity-set" data-clone aria-hidden="true">
            {identities.map((p) => card(p))}
          </div>
          <div className="identity-set" data-original>
            {identities.map((p) => card(p))}
          </div>
          <div className="identity-set" data-clone aria-hidden="true">
            {identities.map((p) => card(p))}
          </div>
        </div>
      </div>
      <div className="identity-carousel-controls">
        <p>
          Selected identities <span>({identities.length})</span>
        </p>
        <div>
          {!reducedMotion && (
            <button
              type="button"
              className="carousel-pause"
              aria-label={paused ? "Play logo carousel" : "Pause logo carousel"}
              onClick={() => setPaused(!paused)}
            >
              {paused ? "Play" : "Pause"}
            </button>
          )}
          <button
            type="button"
            aria-label="Scroll logos left"
            onClick={() => nudge(-1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Scroll logos right"
            onClick={() => nudge(1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
