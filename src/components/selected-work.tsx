"use client";
import { useLayoutEffect, useRef, useState, useId } from "react";
import Image from "next/image";
import { Arrow } from "./arrow";
import { FocusText } from "./focus-text";
import { websiteProjects } from "@/lib/website-projects";
import { logoProjects } from "@/lib/logo-projects";
type Project = {
  name: string;
  sector: string;
  image: string;
  src?: string;
  width?: number;
  height?: number;
  domain?: string;
  url?: string;
};
function nearest(root: HTMLElement) {
  const center = root.scrollLeft + root.clientWidth / 2;
  let best = 0,
    distance = Infinity;
  root.querySelectorAll<HTMLElement>(".project-card").forEach((card, i) => {
    const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
    if (d < distance) {
      distance = d;
      best = i;
    }
  });
  return best;
}
function centerOf(root: HTMLElement, index: number) {
  const card = root.querySelectorAll<HTMLElement>(".project-card")[index];
  return card.offsetLeft - (root.clientWidth - card.offsetWidth) / 2;
}
export function SelectedWork({
  category: kind = "websites",
}: {
  category?: "websites" | "logos";
}) {
  const [active, setActive] = useState(0);
  const projects: readonly Project[] =
      kind === "websites" ? websiteProjects : logoProjects,
    n = projects.length;
  const gallery = useRef<HTMLDivElement>(null),
    settle = useRef<ReturnType<typeof setTimeout> | null>(null),
    dragging = useRef(false);
  const id = useId();
  useLayoutEffect(() => {
    const root = gallery.current!;
    root.dataset.loopReady = "true";
    root.scrollTo({ left: centerOf(root, n), behavior: "instant" });
    const resize = new ResizeObserver(() => {
      const logical = nearest(root) % n;
      root.scrollTo({ left: centerOf(root, n + logical), behavior: "instant" });
    });
    resize.observe(root);
    return () => {
      resize.disconnect();
      if (settle.current) clearTimeout(settle.current);
    };
  }, [kind, n]);
  function goToPhysical(index: number, focus = false) {
    const root = gallery.current!;
    if (index < 0 || index >= n * 3) {
      const current = nearest(root);
      root.scrollTo({
        left: centerOf(root, n + (current % n)),
        behavior: "instant",
      });
      index += index < 0 ? n : -n;
    }
    if (focus) {
      const logical = ((index % n) + n) % n;
      root
        .querySelectorAll<HTMLElement>(".project-card")
        [n + logical].focus({ preventScroll: true });
    }
    root.scrollTo({
      left: centerOf(root, index),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function rebase() {
    const root = gallery.current;
    if (!root || dragging.current) return;
    const index = nearest(root);
    if (index < n || index >= n * 2) {
      // The duplicate has identical neighbours. Preserve its pixel offset during the invisible reset.
      const middle = n + (index % n),
        delta = root.scrollLeft - centerOf(root, index);
      root.scrollTo({
        left: centerOf(root, middle) + delta,
        behavior: "instant",
      });
    }
  }
  function scheduleRebase() {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(rebase, 180);
  }
  function readCenter() {
    const root = gallery.current;
    if (!root) return;
    setActive(nearest(root) % n);
    scheduleRebase();
  }
  return (
    <section
      className="selected-work section"
      id={kind === "websites" ? "work" : "logos"}
      aria-labelledby={`${id}-title`}
    >
      <div className="work-heading">
        <p className="eyebrow">
          {kind === "websites" ? "02 / Selected websites" : "03 / Logo design"}
        </p>
        <FocusText
          id={`${id}-title`}
          text={
            kind === "websites"
              ? "Different businesses. Distinctive solutions."
              : "Identity, made distinctive."
          }
        />
        <p>
          {kind === "websites"
            ? "Selected websites by Trickfilm. Built around the people they serve."
            : "A selection of logos and visual identities designed by Trickfilm."}
        </p>
      </div>
      <div className="gallery-controls">
        <p className="gallery-category">
          {kind === "websites"
            ? "Web design & development"
            : "Marks, wordmarks & identities"}
        </p>
        <div className="gallery-navigation">
          <p aria-live="polite" aria-atomic="true">
            <span>{String(active + 1).padStart(2, "0")}</span> /{" "}
            {String(n).padStart(2, "0")}{" "}
            <span className="gallery-current-name">
              {projects[active].name}
            </span>
          </p>
          <button
            type="button"
            aria-label="Previous project"
            aria-controls={`${id}-gallery`}
            onClick={() => goToPhysical(nearest(gallery.current!) - 1)}
          >
            <span className="arrow-back">
              <Arrow />
            </span>
          </button>
          <button
            type="button"
            aria-label="Next project"
            aria-controls={`${id}-gallery`}
            onClick={() => goToPhysical(nearest(gallery.current!) + 1)}
          >
            <Arrow />
          </button>
        </div>
      </div>
      <div>
        <div
          className={`work-gallery ${kind === "logos" ? "logo-gallery" : ""}`}
          ref={gallery}
          id={`${id}-gallery`}
          role="region"
          aria-label={
            kind === "websites"
              ? "Selected website gallery"
              : "Selected logo design gallery"
          }
          onScroll={readCenter}
          onPointerDown={() => {
            dragging.current = true;
            if (settle.current) clearTimeout(settle.current);
          }}
          onPointerUp={() => {
            dragging.current = false;
            scheduleRebase();
          }}
          onPointerCancel={() => {
            dragging.current = false;
            scheduleRebase();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              goToPhysical(
                nearest(gallery.current!) +
                  (event.key === "ArrowRight" ? 1 : -1),
                true,
              );
            } else if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              goToPhysical(n + (event.key === "Home" ? 0 : n - 1), true);
            }
          }}
        >
          {[0, 1, 2].flatMap((copy) =>
            projects.map((project, i) => {
              const duplicate = copy !== 1,
                isLogo = kind === "logos";
              const children = (
                <>
                  <div
                    className={`project-stage ${isLogo ? "logo-stage" : ""}`}
                  >
                    {isLogo ? (
                      <Image
                        src={project.src!}
                        width={project.width!}
                        height={project.height!}
                        alt={duplicate ? "" : `${project.name} logo design`}
                        sizes="(max-width: 700px) 74vw, 480px"
                      />
                    ) : (
                      <>
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
                            alt={duplicate ? "" : `${project.name} homepage`}
                            sizes="(max-width: 700px) 74vw, 520px"
                          />
                        </div>
                        <span className="project-visit">
                          Visit website <Arrow />
                        </span>
                      </>
                    )}
                  </div>
                  <div className="project-meta">
                    <div>
                      <p>{project.sector}</p>
                      <h3>{project.name}</h3>
                    </div>
                    {!isLogo && (
                      <span className="project-arrow">
                        <Arrow />
                      </span>
                    )}
                  </div>
                </>
              );
              const props = {
                className: `project-card project-${project.image}`,
                "data-original": !duplicate ? "true" : undefined,
                "data-project-index": i,
                "data-active": active === i ? "true" : undefined,
                "aria-current":
                  !duplicate && active === i ? ("true" as const) : undefined,
              };
              return duplicate ? (
                <div
                  key={`${kind}-${copy}-${project.image}`}
                  {...props}
                  aria-hidden="true"
                  inert
                >
                  {children}
                </div>
              ) : isLogo ? (
                <article
                  key={`${kind}-${copy}-${project.image}`}
                  {...props}
                  tabIndex={0}
                >
                  {children}
                </article>
              ) : (
                <a
                  key={`${kind}-${copy}-${project.image}`}
                  {...props}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${project.name} website (opens in a new tab)`}
                >
                  {children}
                </a>
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}
