"use client";
import { useEffect } from "react";
export function PageMotion() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".project-stack .project-panel"),
    );
    let frame = 0;
    const updateScale = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const desktop = window.innerWidth > 900;
      const minimum = desktop ? 0.94 : 0.97;
      const peak = desktop ? 1.025 : 1.012;
      // The top transform origin keeps these reads independent of their own scale.
      const positions = cards.map((card) => ({
        card,
        top: card.getBoundingClientRect().top,
        height: card.offsetHeight,
      }));
      positions.forEach(({ card, top, height }) => {
        if (preference.matches || top >= viewport || top + height <= 0) {
          card.style.removeProperty("--entry-scale");
          return;
        }
        const progress = Math.max(
          0,
          Math.min(1, (viewport - top) / (viewport * 0.65)),
        );
        // Swell during approach, then settle exactly to the normal card size.
        const approaching = progress <= 0.7;
        const phase = approaching ? progress / 0.7 : (progress - 0.7) / 0.3;
        const eased = phase * phase * (3 - 2 * phase);
        const scale = (
          approaching
            ? minimum + (peak - minimum) * eased
            : peak + (1 - peak) * eased
        ).toFixed(4);
        if (card.style.getPropertyValue("--entry-scale") !== scale)
          card.style.setProperty("--entry-scale", scale);
      });
    };
    const scheduleScale = () => {
      if (!frame) frame = requestAnimationFrame(updateScale);
    };
    window.addEventListener("scroll", scheduleScale, { passive: true });
    window.addEventListener("resize", scheduleScale);
    scheduleScale();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            if (!preference.matches) {
              const animation = entry.target.animate(
                [
                  { opacity: 0, transform: "translateY(36px)" },
                  { opacity: 1, transform: "translateY(0)" },
                ],
                {
                  duration: 850,
                  fill: "backwards",
                  delay: entry.target.classList.contains("project-visual")
                    ? 100
                    : 0,
                  easing: "cubic-bezier(.16,1,.3,1)",
                },
              );
              animations.add(animation);
              animation.onfinish = () => animations.delete(animation);
            }
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    const cancelMotion = () => {
      scheduleScale();
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
      }
    };
    preference.addEventListener("change", cancelMotion);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleScale);
      window.removeEventListener("resize", scheduleScale);
      cards.forEach((card) => card.style.removeProperty("--entry-scale"));
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", cancelMotion);
    };
  }, []);
  return null;
}
