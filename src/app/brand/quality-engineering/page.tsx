import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Quality Engineering — Identity exploration 02",
  description:
    "A visual identity family for Quality Engineering: marks, lockups, badges, patterns, and applications.",
  robots: { index: false, follow: false },
};
const base = "/brand-kits/quality-engineering";
export default function QualityEngineeringKit() {
  return (
    <div className={styles.book}>
      <nav className={styles.nav} aria-label="Brand kit navigation">
        <Link href="/">← Trickfilm</Link>
        <span>Identity exploration / 02</span>
        <a href={`${base}/quality-engineering-kit.zip`} download>
          Download visual kit ↓
        </a>
      </nav>
      <main>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Brand / Identity</p>
          <h1>Quality Engineering.</h1>
          <div className={styles.introBottom}>
            <p>One mark. A whole visual language.</p>
            <span>Video-game QA, testing & tools</span>
          </div>
        </header>
        <figure className={styles.showcase}>
          <Image
            src={`${base}/identity-exploration-02.webp`}
            width={1024}
            height={1536}
            alt="Quality Engineering identity family: cobalt and cyan primary lockup, standalone symbol, circular Game QA badge, embroidered black cap, symbol repeat pattern, alternate lockups, branded lanyard and die-cut stickers."
            sizes="(max-width: 700px) 100vw, 1024px"
            priority
          />
          <figcaption>
            Quality Engineering / Visual identity concept / 02
          </figcaption>
        </figure>
        <section className={styles.summary} aria-labelledby="family-heading">
          <div>
            <p className={styles.eyebrow}>The family</p>
            <h2>Built from the mark.</h2>
          </div>
          <p>
            Horizontal and stacked signatures. A compact icon and game-QA badge.
            A repeat pattern with its own rhythm. A connected family across
            apparel, event materials, and print.
          </p>
        </section>
        <div className={styles.palette} aria-label="Proposed concept palette">
          {[
            ["Cobalt", "#1744DB"],
            ["Cyan", "#20BCEB"],
            ["Ink", "#091326"],
            ["White", "#FFFFFF"],
          ].map(([name, hex]) => (
            <div
              key={name}
              style={{
                background: hex,
                color: name === "White" || name === "Cyan" ? "#091326" : "#fff",
              }}
            >
              <span>{name}</span>
              <strong>{hex}</strong>
            </div>
          ))}
        </div>
        <footer className={styles.footer}>
          <div className={styles.links}>
            <a href={`${base}/quality-engineering-guidelines.pdf`} download>
              Download presentation PDF ↓
            </a>
            <a href={`${base}/quality-engineering-kit.zip`} download>
              Download concept assets ↓
            </a>
          </div>
          <p>
            Proposed identity exploration. AI-assisted mock-ups illustrate the
            direction; final symbol details, lettering, and production artwork
            remain subject to refinement and approval.
          </p>
          <details className={styles.source}>
            <summary>Original supplied artwork</summary>
            <div>
              <Image
                src={`${base}/supplied-symbol.png`}
                width={600}
                height={400}
                alt="Original supplied Quality Engineering blue and silver symbol"
              />
              <Image
                src={`${base}/supplied-lockup.png`}
                width={833}
                height={556}
                alt="Original supplied Quality Engineering lockup"
              />
            </div>
            <p>The original files are preserved unchanged in the download.</p>
          </details>
        </footer>
      </main>
    </div>
  );
}
