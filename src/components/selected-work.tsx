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
export function SelectedWork() {
  const [kind, setKind] = useState<"websites" | "logos">("websites"),
    [active, setActive] = useState(0);
  const projects: readonly Project[] =
      kind === "websites" ? websiteProjects : logoProjects,
    n = projects.length;
  const gallery = useRef<HTMLDivElement>(null),
    settle = useRef<ReturnType<typeof setTimeout> | null>(null),
    dragging = useRef(false);
  const id = useId(),
    tabs = useRef<HTMLDivElement>(null);
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
  function changeKind(next: "websites" | "logos") {
    if (settle.current) clearTimeout(settle.current);
    setActive(0);
    setKind(next);
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
          Websites and visual identities by Trickfilm.
          <br />
          Built around the people they serve.
        </p>
      </div>
      <div className="gallery-controls">
        <div
          className="work-tabs"
          role="tablist"
          aria-label="Portfolio category"
          ref={tabs}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? "websites"
                : event.key === "End"
                  ? "logos"
                  : kind === "websites"
                    ? "logos"
                    : "websites";
            changeKind(next);
            tabs.current
              ?.querySelectorAll<HTMLButtonElement>("button")
              [next === "websites" ? 0 : 1].focus();
          }}
        >
          {(["websites", "logos"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              id={`${id}-${tab}`}
              aria-selected={kind === tab}
              aria-controls={`${id}-panel`}
              tabIndex={kind === tab ? 0 : -1}
              onClick={() => changeKind(tab)}
            >
              {tab === "websites" ? "Websites" : "Logo design"}
              <span>{tab === "websites" ? "05" : "18"}</span>
            </button>
          ))}
        </div>
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
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${kind}`}>
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
