"use client";

import { useEffect, useRef, useState } from "react";

type Service = { name: string; copy: string; items: string[] };

export function ServicesScroll({ services }: { services: Service[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.service));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    root.current
      ?.querySelectorAll("[data-service]")
      .forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="services-story" ref={root}>
      <div className="services-stage" aria-hidden="true">
        <p className="eyebrow">(Services)</p>
        <div className="service-symbols">
          {services.map((service, i) => (
            <div
              className="service-glyph"
              data-active={active === i}
              key={service.name}
            >
              <span>{i + 1}</span>
            </div>
          ))}
        </div>
        <p className="service-progress">
          0{active + 1} / 0{services.length}
        </p>
      </div>
      <div className="service-list">
        {services.map((service, i) => (
          <article className="service-row" key={service.name} data-service={i}>
            <span className="service-mobile-index" aria-hidden="true">
              0{i + 1}
            </span>
            <div>
              {i === 0 && (
                <h2 className="services-title" id="services-heading">
                  A little ingenuity.
                  <br />A lot of possibility.
                </h2>
              )}
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
