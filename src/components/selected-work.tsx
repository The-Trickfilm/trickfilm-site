"use client";
import { useRef, useState, useId } from "react";
import Image from "next/image";
import { Arrow } from "./arrow";
import { FocusText } from "./focus-text";
const projects = [
  {
    name: "Gower Modern Law",
    sector: "Legal services",
    domain: "gowermodernlaw.com",
    url: "https://gowermodernlaw.com/",
    image: "gower",
  },
  {
    name: "North Vancouver FC",
    sector: "Community sport",
    domain: "nvfc.ca",
    url: "https://nvfc.ca/",
    image: "nvfc",
  },
  {
    name: "Streamworks Designs",
    sector: "Water features & landscape design",
    domain: "streamworksdesigns.com",
    url: "https://www.streamworksdesigns.com/",
    image: "streamworks",
  },
  {
    name: "Access to Justice BC",
    sector: "Access to justice",
    domain: "accesstojusticebc.ca",
    url: "https://accesstojusticebc.ca/",
    image: "a2j",
  },
  {
    name: "StrataCouncil.ca",
    sector: "Strata council resources",
    domain: "stratacouncil.ca",
    url: "https://www.stratacouncil.ca/",
    image: "stratacouncil",
  },
];
export function SelectedWork() {
  const [active, setActive] = useState(0);
  const gallery = useRef<HTMLDivElement>(null);
  const id = useId();
  function goTo(index: number, focus = false) {
    const root = gallery.current;
    if (!root) return;
    const next = Math.max(0, Math.min(projects.length - 1, index));
    const card = root.querySelectorAll<HTMLElement>(".project-card")[next];
    if (focus) card.focus({ preventScroll: true });
    root.scrollTo({
      left: card.offsetLeft - (root.clientWidth - card.offsetWidth) / 2,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function readCenter() {
    const root = gallery.current;
    if (!root) return;
    const center = root.scrollLeft + root.clientWidth / 2;
    let distance = Infinity,
      index = 0;
    root.querySelectorAll<HTMLElement>(".project-card").forEach((card, i) => {
      const delta = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (delta < distance) {
        distance = delta;
        index = i;
      }
    });
    setActive(index);
  }

  return (
    <section
      className="selected-work section"
      id="work"
      aria-labelledby="work-title"
    >
      <div className="work-heading">
        <p className="eyebrow">02 / Selected work</p>
        <FocusText
          id="work-title"
          text="Different businesses. Distinctive solutions."
        />
        <p>
          Selected websites by Trickfilm.
          <br />
          Built around the people they serve.
        </p>
      </div>
      <div className="gallery-controls">
        <p aria-live="polite" aria-atomic="true">
          <span>{String(active + 1).padStart(2, "0")}</span> / 05{" "}
          <span className="gallery-current-name">{projects[active].name}</span>
        </p>
        <div>
          <button
            type="button"
            aria-label="Previous project"
            aria-controls={id}
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
          >
            <span className="arrow-back">
              <Arrow />
            </span>
          </button>
          <button
            type="button"
            aria-label="Next project"
            aria-controls={id}
            disabled={active === projects.length - 1}
            onClick={() => goTo(active + 1)}
          >
            <Arrow />
          </button>
        </div>
      </div>
      <div
        className="work-gallery"
        ref={gallery}
        id={id}
        role="region"
        aria-label="Selected website gallery"
        onScroll={readCenter}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(active + 1, true);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(active - 1, true);
          } else if (event.key === "Home") {
            event.preventDefault();
            goTo(0, true);
          } else if (event.key === "End") {
            event.preventDefault();
            goTo(projects.length - 1, true);
          }
        }}
      >
        {projects.map((project, i) => (
          <a
            key={project.image}
            className={`project-card project-${project.image}`}
            aria-current={active === i ? "true" : undefined}
            onFocus={() => goTo(i)}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${project.name} website (opens in a new tab)`}
          >
            <div className="project-stage">
              <div className="project-screen">
                <div className="project-chrome" aria-hidden="true">
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{project.domain}</span>
                  <Arrow />
                </div>
                <Image
                  src={`/work/${project.image}.webp`}
                  width={1200}
                  height={833}
                  alt={`${project.name} homepage`}
                  sizes="(max-width: 700px) 78vw, (max-width: 1200px) 60vw, 680px"
                />
              </div>
              <span className="project-visit">
                Visit website <Arrow />
              </span>
            </div>
            <div className="project-meta">
              <div>
                <p>{project.sector}</p>
                <h3>{project.name}</h3>
              </div>
              <span className="project-arrow">
                <Arrow />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
