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
          <a href="#approach">Our approach</a>
          <a href="#work">What we do</a>
          <a className="nav-contact" href="#contact">
            Let’s talk{" "}
            <span>
              <Arrow />
            </span>
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="dot" /> Creativity × technology
            </p>
            <h1 id="hero-title">
              Trickfilm brings
              <br />
              clarity to <em>complexity.</em>
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
                  See our work <span>↓</span>
                </a>
              </div>
            </div>
          </div>
          <Mountain />
          <div className="hero-caption">
            <span>Clear thinking. Creative doing.</span>
            <span>Scroll for perspective ↓</span>
          </div>
        </section>
        <section className="approach section" id="approach">
          <p className="eyebrow">01 / A fresh perspective</p>
          <div>
            <h2>
              Complex challenges.
              <br />
              <span>Thoughtfully simple solutions.</span>
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
        <section className="services section" id="work">
          <div className="section-heading">
            <p className="eyebrow">02 / What we do</p>
            <h2>Ideas into action.</h2>
            <p>Four ways to move your business forward.</p>
          </div>
          <div className="service-grid">
            {services.map(([n, title, heading, body]) => (
              <article key={n}>
                <div className="service-top">
                  <span>{n}</span>
                  <span aria-hidden="true">
                    <Arrow />
                  </span>
                </div>
                <p className="service-name">{title}</p>
                <h3>{heading}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <p className="work-note">
            Every business has a different starting point. Ours is understanding
            yours.
          </p>
        </section>
        <section className="contact section" id="contact">
          <p className="eyebrow">03 / Let’s find the way forward</p>
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
