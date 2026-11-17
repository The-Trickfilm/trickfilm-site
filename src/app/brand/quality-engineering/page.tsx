import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Quality Engineering — Brand kit draft",
  description:
    "A proposed identity system for Quality Engineering, by Trickfilm.",
  robots: { index: false, follow: false },
};
const base = "/brand-kits/quality-engineering";
const colors = [
  { name: "Midnight", hex: "#101827", rgb: "16 · 24 · 39", light: false },
  {
    name: "Engineering blue",
    hex: "#163A8F",
    rgb: "22 · 58 · 143",
    light: false,
  },
  { name: "Signal cyan", hex: "#20B4E8", rgb: "32 · 180 · 232", light: true },
  { name: "Mist", hex: "#DCE4EF", rgb: "220 · 228 · 239", light: true },
  { name: "White", hex: "#FFFFFF", rgb: "255 · 255 · 255", light: true },
];
function Lockup({ className = "" }: { className?: string }) {
  return (
    <Image
      className={`${styles.lockup} ${className}`}
      src={`${base}/supplied-lockup.png`}
      width={833}
      height={556}
      alt="Quality Engineering — Integrated Quality Assurance, supplied symbol and wordmark"
    />
  );
}
function SectionTitle({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.eyebrow}>{number} / Identity system</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}
export default function QualityEngineeringKit() {
  return (
    <div className={styles.book}>
      <nav className={styles.nav} aria-label="Brand kit navigation">
        <Link href="/">← Trickfilm</Link>
        <span>Quality Engineering / Pilot 01</span>
        <a href={`${base}/quality-engineering-kit.zip`} download>
          Download draft kit ↓
        </a>
      </nav>
      <main>
        <section className={`${styles.sheet} ${styles.cover}`}>
          <div className={styles.coverTop}>
            <p className={styles.eyebrow}>Quality Engineering</p>
            <span className={styles.status}>
              Identity pilot · Working draft
            </span>
          </div>
          <div className={styles.coverGrid}>
            <div>
              <h1>
                Confidence.
                <br />
                In every build.
              </h1>
              <p className={styles.lead}>
                Quality assurance, testing, and tools for video games.
              </p>
              <p className={styles.coverNote}>
                A precise identity system built around the supplied symbol and
                wordmark. Proposed tagline and supporting design direction for
                review.
              </p>
            </div>
            <div className={styles.heroMark}>
              <Lockup />
              <span>Supplied lockup · unmodified artwork</span>
            </div>
          </div>
          <footer className={styles.coverFooter}>
            <span>Brand foundations / Visual language / Applications</span>
            <span>Trickfilm — 01</span>
          </footer>
        </section>
        <section className={styles.sheet}>
          <SectionTitle
            number="01"
            title="One identity. Two signatures."
            copy="Keep the familiar symbol and existing wordmark together. Build recognition through consistent use, rather than adding a new logo."
          />
          <div className={styles.twoColumn}>
            <div className={`${styles.logoStage} ${styles.dark}`}>
              <Lockup />
              <p>Primary horizontal lockup / supplied</p>
            </div>
            <div className={styles.symbolStage}>
              <Image
                src={`${base}/supplied-symbol.png`}
                width={600}
                height={400}
                alt="Supplied blue and silver Quality Engineering symbol"
              />
              <p>Standalone symbol / supplied presentation artwork</p>
            </div>
          </div>
          <div className={styles.ruleGrid}>
            <div>
              <h3>Primary signature</h3>
              <p>
                The supplied symbol, wordmark, and “Integrated Quality
                Assurance” line remain intact. Use the complete lockup on dark,
                quiet backgrounds.
              </p>
            </div>
            <div>
              <h3>Small-format use</h3>
              <p>
                The symbol is the starting point for app and avatar artwork. A
                simplified flat master must be checked at small sizes before
                exporting final icons.
              </p>
            </div>
            <div>
              <h3>Next artwork pass</h3>
              <p>
                Prepare stacked and badge lockups, plus black, white, and
                reversed vector masters. These are next-step deliverables, not
                recreated from the raster proofs here.
              </p>
            </div>
          </div>
        </section>
        <section className={styles.sheet}>
          <SectionTitle
            number="02"
            title="A clear signal."
            copy="A proposed digital palette, informed by the supplied blue-and-silver mark. Cyan brings focus; deep blue provides a calm technical foundation."
          />
          <div className={styles.palette}>
            {colors.map((color) => (
              <div
                key={color.hex}
                className={styles.swatch}
                style={{
                  background: color.hex,
                  color: color.light ? "#101827" : "white",
                }}
              >
                <span>{color.name}</span>
                <strong>{color.hex}</strong>
                <small>RGB {color.rgb}</small>
              </div>
            ))}
          </div>
          <div className={styles.typeGrid}>
            <div>
              <p className={styles.eyebrow}>Display / Inter Tight · 700</p>
              <p className={styles.typeDisplay}>
                Built for
                <br />
                better builds.
              </p>
              <span className={styles.spec}>
                64/64 desktop · 40/42 mobile · −0.04em tracking
              </span>
            </div>
            <div>
              <p className={styles.eyebrow}>Text / Inter · 400–600</p>
              <p className={styles.typeBody}>
                Make complex testing information easy to scan. Use direct
                headings, readable descriptions, and consistent labels.
              </p>
              <p>
                Body: 18/28. Labels: 12/16, medium. Status labels always use
                words or icons alongside color.
              </p>
              <p className={styles.note}>
                This is a supporting type system, not a claim about the original
                logo font. Print values require an agreed CMYK output profile
                and physical Pantone matching.
              </p>
            </div>
          </div>
        </section>
        <section className={`${styles.sheet} ${styles.dark}`}>
          <SectionTitle
            number="03"
            title="Coverage, made visible."
            copy="A restrained supporting language of grids, targets, and checks. Precise, modular, and designed to make complex testing information clear."
          />
          <div className={styles.graphicsGrid}>
            <div className={styles.pattern}>
              <span>Coverage grid / proposed repeat pattern</span>
            </div>
            <div className={styles.iconPanel}>
              {["check", "coverage", "workflow"].map((name) => (
                <div key={name}>
                  <Image
                    src={`${base}/icon-${name}.svg`}
                    width={48}
                    height={48}
                    alt={`${name} supporting icon`}
                  />
                  <span>{name}</span>
                </div>
              ))}
              <p>2px strokes · square ends · consistent 32px grid</p>
            </div>
          </div>
          <div className={styles.diagram}>
            <span>Define</span>
            <i aria-hidden="true" />
            <span>Exercise</span>
            <i aria-hidden="true" />
            <span>Observe</span>
            <i aria-hidden="true" />
            <span>Improve</span>
          </div>
          <p className={styles.note}>
            Proposed process illustration and supporting graphics. They extend
            the identity; they do not replace or redraw its mark.
          </p>
        </section>
        <section className={styles.sheet}>
          <SectionTitle
            number="04"
            title="Ready for the real world."
            copy="Illustrative applications show how the same system can move from a testing workspace to print and presentation materials."
          />
          <div className={styles.applicationGrid}>
            <div className={styles.workspace}>
              <div className={styles.windowBar}>
                <span>QE / WORKSPACE</span>
                <span>Interface study</span>
              </div>
              <div className={styles.workspaceBody}>
                <aside>
                  <b>Overview</b>
                  <span>Test plans</span>
                  <span>Sessions</span>
                  <span>Reports</span>
                </aside>
                <div>
                  <p className={styles.eyebrow}>Example project</p>
                  <h3>Build review</h3>
                  <div className={styles.testRow}>
                    <span>Controller input</span>
                    <b>In review</b>
                  </div>
                  <div className={styles.testRow}>
                    <span>Save & resume</span>
                    <b>Queued</b>
                  </div>
                  <div className={styles.testRow}>
                    <span>UI navigation</span>
                    <b>Ready</b>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.stationery}>
              <div className={styles.businessCard}>
                <Lockup />
                <span>
                  Name Surname
                  <br />
                  Role / Title
                </span>
                <small>Contact details placeholder</small>
              </div>
              <div className={styles.deckCover}>
                <p>Quality Engineering</p>
                <strong>
                  Release
                  <br />
                  readiness.
                </strong>
                <span>Presentation cover study</span>
              </div>
            </div>
          </div>
          <p className={styles.note}>
            Concept applications only. The workspace is a visual mock-up, not a
            working application, case study, or claim about client results.
          </p>
        </section>
        <section className={styles.sheet}>
          <SectionTitle
            number="05"
            title="Consistency is the quality check."
            copy="Simple proposed usage rules, and a handover of what is supplied, what is proposed, and what needs the master artwork."
          />
          <div className={styles.ruleGrid}>
            <div>
              <h3>Give the mark room</h3>
              <p>
                Start with clear space equal to ¼ of the symbol width. Keep
                copy, borders, and other marks outside that area. Confirm the
                final unit with the vector master.
              </p>
            </div>
            <div>
              <h3>Keep it intact</h3>
              <p>
                Do not stretch, retype, rotate, recolor individual parts, or add
                extra effects to the supplied identity. Avoid busy backgrounds
                behind the lockup.
              </p>
            </div>
            <div>
              <h3>Proof the small sizes</h3>
              <p>
                The supplied renderings demonstrate the identity. Do not treat
                them as final favicons, embroidery files, or print masters.
                Check flat artwork at its intended output size.
              </p>
            </div>
          </div>
          <div className={styles.handover}>
            <div>
              <p className={styles.eyebrow}>Included in this pilot</p>
              <ul>
                <li>Unmodified source symbol and wordmark PNGs</li>
                <li>Proposed digital palette and type hierarchy</li>
                <li>Repeat pattern and supporting SVG icons</li>
                <li>This guideline draft and application studies</li>
              </ul>
            </div>
            <div>
              <p className={styles.eyebrow}>To finalize after review</p>
              <ul>
                <li>Original vector logo and approved alternate lockups</li>
                <li>Flat color, black, white, and reversed exports</li>
                <li>Clear-space units and small-size proofing</li>
                <li>Profiled CMYK and physical Pantone selection</li>
              </ul>
            </div>
          </div>
          <div className={styles.downloads}>
            <a href={`${base}/quality-engineering-guidelines.pdf`} download>
              Download guideline PDF ↓
            </a>
            <a href={`${base}/quality-engineering-kit.zip`} download>
              Download pilot assets ↓
            </a>
            <span>Draft for review / not a production artwork release</span>
          </div>
        </section>
      </main>
    </div>
  );
}
