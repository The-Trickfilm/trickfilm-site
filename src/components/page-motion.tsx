"use client";
import { useEffect } from "react";
export function PageMotion() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
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
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
      }
    };
    preference.addEventListener("change", cancelMotion);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", cancelMotion);
    };
  }, []);
  return null;
}
