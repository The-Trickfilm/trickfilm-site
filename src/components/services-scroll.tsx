"use client";

import { useEffect, useRef, useState } from "react";
import { ServiceNumber } from "./service-number";

type Service = { name: string; copy: string; items: string[] };

export function ServicesScroll({ services }: { services: Service[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rows = Array.from(
      root.current?.querySelectorAll<HTMLElement>("[data-service]") || [],
    );
    let previousActive = -1;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const updateRotation = () => {
      frame = 0;
      const element = root.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const symbol = element.querySelector<HTMLElement>(".service-symbols");
      const symbolBounds = symbol?.getBoundingClientRect();
      const focusY = symbolBounds?.height
        ? symbolBounds.top + symbolBounds.height / 2
        : innerHeight / 2;
      let closest = 0,
        nearest = Infinity;
      rows.forEach((row, index) => {
        const bounds = row.getBoundingClientRect();
        const copy = row.querySelector<HTMLElement>(".service-copy")!;
        const content = copy.getBoundingClientRect();
        const distance = Math.abs(content.top + content.height / 2 - focusY);
        if (distance < nearest) {
          nearest = distance;
          closest = index;
        }
        const opacity = Math.max(
          0,
          1 - Math.max(0, distance - 80) / (bounds.height * 0.7),
        );
        row.style.setProperty("--service-opacity", String(opacity));
      });
      if (closest !== previousActive) {
        previousActive = closest;
        setActive(closest);
      }

      const progress = Math.max(
        0,
        Math.min(1, (focusY - rect.top) / rect.height),
      );
      element.style.setProperty(
        "--service-turn",
        `${media.matches ? 0 : progress * 540}deg`,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(updateRotation);
    };
    updateRotation();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div className="services-story" ref={root}>
      <div className="services-stage">
        <p className="eyebrow">(Services)</p>
        <h2 className="services-title" id="services-heading">
          A little ingenuity.
          <br />A lot of possibility.
        </h2>
        <div className="service-symbols" aria-hidden="true">
          <span className="services-flower" />
          {services.map((service, i) => (
            <div
              className="service-glyph"
              data-active={active === i}
              key={service.name}
            >
              <ServiceNumber number={i + 1} />
            </div>
          ))}
        </div>
        <p className="service-progress" aria-hidden="true">
          0{active + 1} / 0{services.length}
        </p>
      </div>
      <div className="service-list">
        {services.map((service, i) => (
          <article className="service-row" key={service.name} data-service={i}>
            <span className="service-mobile-index" aria-hidden="true">
              <span className="service-mobile-flower" />
              <span className="service-mobile-number">
                <ServiceNumber number={i + 1} />
              </span>
            </span>
            <div className="service-copy">
              <h3>{service.name}</h3>
              <p>{service.copy}</p>
              <ul>
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
