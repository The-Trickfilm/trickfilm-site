"use client";
import { useEffect, useRef } from "react";
export function FocusText({
  text,
  as: Tag = "h2",
  className = "",
  id,
}: {
  text: string;
  as?: "h2" | "p";
  className?: string;
  id?: string;
}) {
  const root = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);
  useEffect(() => {
    const el = root.current!,
      media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      visible = false;
    function draw() {
      frame = 0;
      const box = el.getBoundingClientRect();
      const p = media.matches
        ? 1
        : Math.max(
            0,
            Math.min(
              1,
              (innerHeight * 0.94 - box.top) /
                (innerHeight * 0.28 + box.height * 0.25),
            ),
          );
      el.querySelectorAll<HTMLElement>("[data-word]").forEach(
        (word, i, words) => {
          const local = Math.max(
            0,
            Math.min(1, (p - (i / words.length) * 0.18) / 0.82),
          );
          word.style.filter = `blur(${(1 - local) * 7}px)`;
          word.style.opacity = String(0.28 + local * 0.72);
        },
      );
      el.dataset.focusProgress = p.toFixed(3);
    }
    function schedule() {
      if (!frame && visible) frame = requestAnimationFrame(draw);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { rootMargin: "80px" },
    );
    observer.observe(el);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    media.addEventListener("change", draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      media.removeEventListener("change", draw);
    };
  }, []);
  return (
    <Tag ref={root} className={`focus-text ${className}`} id={id}>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          <span data-word>{word}</span>{" "}
        </span>
      ))}
    </Tag>
  );
}
