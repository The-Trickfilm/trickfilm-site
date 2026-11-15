"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { logoProjects } from "@/lib/logo-projects";
import { Arrow } from "./arrow";
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
export function BrandingGallery() {
  const [active, setActive] = useState<number | null>(null),
    dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (active === null) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [active]);
  function close() {
    dialog.current?.close();
    setActive(null);
  }
  function open(index: number) {
    setActive(index);
    dialog.current?.showModal();
  }
  function card(project: (typeof identities)[number], index: number) {
    return (
      <a
        className="identity-card"
        key={project.image}
        href={project.src}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          open(index);
        }}
        aria-label={`View ${project.name} logo`}
      >
        <div className="identity-image">
          <Image
            src={project.src}
            width={project.width}
            height={project.height}
            alt={`${project.name} logo design`}
            sizes="(max-width: 600px) 44vw, (max-width: 1000px) 44vw, 29vw"
          />
        </div>
        <div className="identity-caption">
          <h3>{project.name}</h3>
          <Arrow />
        </div>
      </a>
    );
  }
  const selected = active === null ? null : identities[active];
  return (
    <>
      <div className="identity-grid">{identities.slice(0, 6).map(card)}</div>
      <details className="more-identities">
        <summary>
          <span>More identities ({identities.length})</span>
          <span className="summary-plus" aria-hidden="true">
            +
          </span>
        </summary>
        <div className="identity-grid">
          {identities.slice(6).map((p, i) => card(p, i + 6))}
        </div>
      </details>
      <dialog
        ref={dialog}
        className="identity-dialog"
        aria-labelledby="identity-dialog-title"
        onCancel={() => setActive(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            setActive((i) => ((i ?? 0) + 1) % identities.length);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setActive(
              (i) => ((i ?? 0) - 1 + identities.length) % identities.length,
            );
          }
        }}
      >
        <div className="dialog-content">
          <div className="dialog-header">
            <p id="identity-dialog-title">{selected?.name}</p>
            <button
              type="button"
              autoFocus
              onClick={close}
              aria-label="Close logo preview"
            >
              Close ×
            </button>
          </div>
          {selected && (
            <div className="dialog-image">
              <Image
                src={selected.src}
                width={selected.width}
                height={selected.height}
                alt={`${selected.name} logo design`}
                sizes="90vw"
              />
            </div>
          )}
          <div className="dialog-controls">
            <p>
              {active === null
                ? ""
                : `${String(active + 1).padStart(2, "0")} / ${identities.length}`}
            </p>
            <div>
              <button
                type="button"
                aria-label="Previous logo"
                onClick={() =>
                  setActive(
                    (i) =>
                      ((i ?? 0) - 1 + identities.length) % identities.length,
                  )
                }
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next logo"
                onClick={() =>
                  setActive((i) => ((i ?? 0) + 1) % identities.length)
                }
              >
                →
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
