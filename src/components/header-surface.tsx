"use client";
import { useEffect } from "react";
/** Keep transparent navigation legible over the section beneath it. */
export function HeaderSurface() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".header")!;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main>section,footer"),
    );
    let frame = 0;
    function update() {
      frame = 0;
      const y = header.getBoundingClientRect().height * 0.5;
      const section = sections.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      });
      header.dataset.surface =
        !section || section.matches(".hero,.perspective,.contact,footer")
          ? "dark"
          : "light";
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);
  return null;
}
