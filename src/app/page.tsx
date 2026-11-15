import { SelectedWork } from "@/components/selected-work";
import { ServiceExplorer } from "@/components/service-explorer";
import { Arrow } from "@/components/arrow";
import Image from "next/image";
import { Mountain } from "@/components/mountain";
const services = [
  [
    "01",
    "Web design",
    "A clearer presence.",
    "Thoughtful websites that make your business easier to understand, explore, and choose.",
  ],
  [
    "02",
    "Workflow automation",
    "Less friction. More flow.",
    "Connect the tools you use, simplify repetitive tasks, and give your team time back.",
  ],
  [
    "03",
    "Custom applications",
    "Built around your business.",
    "Practical software shaped around your people, processes, and the way you work.",
  ],
  [
    "04",
    "AI consulting",
    "Possibility, with purpose.",
    "Find where AI can make a useful difference, then turn the opportunity into a practical next step.",
  ],
];
function ServiceIcon({ kind }: { kind: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "web" ? (
        <>
          <rect x="3" y="4" width="26" height="19" rx="1" />
          <path d="M16 23v5m-6 0h12" />
        </>
      ) : kind === "workflow" ? (
        <>
          <circle cx="16" cy="6" r="4" />
          <circle cx="6" cy="25" r="4" />
          <circle cx="26" cy="25" r="4" />
          <path d="m14 10-6 11m10-11 6 11M10 25h12" />
        </>
      ) : (
        <>
          <path d="m2 10 14-7 14 7-14 7-14-7Zm0 7 14 7 14-7M2 24l14 7 14-7" />
        </>
      )}
    </svg>
  );
}
export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <a href="#" aria-label="Trickfilm home">
          <Image
            src="/brand/trickfilm-logo.svg"
            width={200}
            height={45}
            alt="Trickfilm"
            priority
          />
        </a>
        <nav aria-label="Main navigation">
          <details className="services-menu">
            <summary>
              Services <span aria-hidden="true">⌄</span>
            </summary>
            <div>
              {services.map(([n, title]) => (
                <a key={n} href={`#service-${n}`}>
                  {title}
                </a>
              ))}
            </div>
          </details>
          <a href="#work">Work</a>
          <a href="#approach">About</a>
          <a className="nav-contact" href="#contact">
            Let’s talk{" "}
            <span>
              <Arrow />
            </span>
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero-scroll" aria-labelledby="hero-title">
          <div className="hero">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="dot" /> Creative technology studio
              </p>
              <h1 id="hero-title">
                <span>Trickfilm brings</span> <span>clarity to</span>{" "}
                <em>complexity.</em>
              </h1>
              <div className="hero-bottom">
                <p>
                  We apply creativity and technology to focus on your business
                  challenges — turning them into working solutions.
                </p>
                <div className="actions">
                  <a className="button" href="#contact">
                    Let&apos;s solve something{" "}
                    <span>
                      <Arrow />
                    </span>
                  </a>
                  <a className="text-link" href="#work">
                    See our work
                  </a>
                </div>
              </div>
              <ul className="hero-services" aria-label="Our services">
                <li>
                  <ServiceIcon kind="web" />
                  <span>Web Design</span>
                </li>
                <li>
                  <ServiceIcon kind="workflow" />
                  <span>
                    Workflow
                    <br />
                    Automation
                  </span>
                </li>
                <li>
                  <ServiceIcon kind="apps" />
                  <span>
                    Custom
                    <br />
                    Applications
                  </span>
                </li>
              </ul>
            </div>
            <Mountain />
            <div className="hero-caption">
              <span>Clear thinking. Creative doing.</span>
              <span>Scroll for perspective ↓</span>
            </div>
          </div>
        </section>
        <SelectedWork />
        <section className="approach section" id="approach">
          <div className="approach-mark">
            <p className="eyebrow">02 / A fresh perspective</p>
            <Image
              src="/brand/trickfilm-symbol.svg"
              width={200}
              height={196}
              alt=""
            />
          </div>
          <div>
            <h2>
              A fresh perspective
              <br />
              <span>changes everything.</span>
            </h2>
            <p className="intro">
              The right solution starts with seeing the whole picture. We bring
              curious minds, creative thinking, and technical know-how to the
              things holding your business back.
            </p>
            <p className="small-copy">
              From a better website to a smoother workflow, we turn “there must
              be a better way” into something you can use.
            </p>
          </div>
        </section>
        <section className="services section" id="services">
          <div className="section-heading">
            <p className="eyebrow">03 / Services</p>
            <h2>
              Good thinking.
              <br />
              <span>Working solutions.</span>
            </h2>
            <p>
              Four disciplines. One focus:
              <br />
              making your business work better.
            </p>
          </div>
          <ServiceExplorer />
          <p className="work-note">
            Every business has a different starting point. Ours is understanding
            yours.
          </p>
        </section>
        <section className="method section" aria-labelledby="method-title">
          <div className="method-heading">
            <p className="eyebrow">
              04 / From a question to a working solution
            </p>
            <h2 id="method-title">
              The way forward
              <br />
              starts with <em>understanding.</em>
            </h2>
          </div>
          <div className="method-steps">
            <article>
              <span>01 / Get clear</span>
              <h3>Start with the real challenge.</h3>
              <p>
                Listen to your team. Look at the way work happens. Find the
                friction before deciding what to build.
              </p>
            </article>
            <article>
              <span>02 / Make it tangible</span>
              <h3>Bring the right idea into focus.</h3>
              <p>
                Explore a practical direction, make it concrete, and test it
                against the people and processes it needs to support.
              </p>
            </article>
            <article>
              <span>03 / Put it to work</span>
              <h3>Build for the everyday.</h3>
              <p>
                Turn the idea into a useful solution. Keep the experience clear,
                then refine it with what you learn.
              </p>
            </article>
          </div>
        </section>
        <section className="contact section" id="contact">
          <p className="eyebrow">05 / Let’s find the way forward</p>
          <div>
            <h2>
              What could work
              <br />
              <em>better for you?</em>
            </h2>
            <p>
              A challenge, an idea, or a question.
              <br />
              That’s a good place to start.
            </p>
            <p className="contact-note">Contact details are coming soon.</p>
          </div>
          <Image
            src="/brand/trickfilm-symbol.svg"
            width={240}
            height={235}
            alt=""
          />
        </section>
      </main>
      <footer>
        <Image
          src="/brand/trickfilm-logo.svg"
          width={160}
          height={36}
          alt="Trickfilm"
        />
        <p>Creativity and technology. Working together.</p>
        <span>© 2026 Trickfilm</span>
      </footer>
    </>
  );
}
