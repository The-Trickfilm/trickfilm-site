import Image from "next/image";
import {
  websiteProjects,
  applicationProject,
  CONTACT_EMAIL,
} from "@/lib/projects";
import { ProjectPanel } from "@/components/project-panel";
import { BrandingGallery } from "@/components/branding-gallery";
import { PageMotion } from "@/components/page-motion";
import { Arrow } from "@/components/arrow";
import { ServicesScroll } from "@/components/services-scroll";
import { ContactForm } from "@/components/contact-form";
const services = [
  {
    name: "Web design",
    copy: "Clear, considered websites that tell your story and make the next step easy.",
    items: [
      "Website design & development",
      "Responsive interfaces",
      "Ongoing support",
    ],
  },
  {
    name: "Branding",
    copy: "Distinctive identities that give your business a recognizable, consistent presence.",
    items: ["Logo design", "Visual identity", "Brand guidelines"],
  },
  {
    name: "Graphic Design",
    copy: "Thoughtful design for the things your business puts into the world, in print and on screen.",
    items: ["Print & editorial", "Marketing materials", "Digital assets"],
  },
  {
    name: "Workflow Automation",
    copy: "Connected tools and practical automations that take repetitive work off your plate.",
    items: ["Connected systems", "Automated workflows", "Practical AI"],
  },
  {
    name: "Business Process Design",
    diagram: "/work/processes/business-process.png",
    copy: "A clearer way of working, built around your people, your tools, and your business.",
    items: ["Process mapping", "Workflow planning", "Business systems"],
  },
];
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PageMotion />
      <a className="home-mark" href="#intro" aria-label="Trickfilm home">
        <Image
          src="/brand/trickfilm-symbol.svg"
          width={52}
          height={51}
          alt=""
          priority
        />
      </a>
      <main id="main">
        <section className="hero" id="intro" aria-labelledby="hero-heading">
          <header className="topbar">
            <p>Independent creative studio.</p>
          </header>
          <div className="hero-layout">
            <nav className="hero-navigation" aria-label="Main navigation">
              <a href="#work">Work</a>
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="hero-introduction">
              <h1 id="hero-heading">
                Good ideas.
                <br />
                Beautifully executed.
              </h1>
              <p>
                We bring together design, technology, and a little ingenuity to
                help businesses look better, work smarter, and solve problems in
                new ways.
              </p>
              <a href="#work" className="explore-link">
                <span className="flower-accent">
                  <span aria-hidden="true">↓</span>
                </span>
                <span>Explore our work</span>
              </a>
            </div>
          </div>
          <div className="hero-wordmark">
            <Image
              src="/brand/trickfilm-logo.svg"
              width={2000}
              height={451}
              alt="Trickfilm"
              priority
            />
          </div>
        </section>
        <section
          id="work"
          className="work-section"
          aria-labelledby="work-heading"
        >
          <h2 id="work-heading" className="sr-only">
            Selected websites
          </h2>
          <div className="project-stack">
            {websiteProjects.map((project) => (
              <ProjectPanel key={project.slug} project={project} />
            ))}
          </div>
        </section>
        <section
          id="branding"
          className="branding section-content"
          aria-labelledby="branding-heading"
        >
          <div className="section-introduction" data-reveal>
            <p className="eyebrow">(Brand/Identity)</p>
            <div>
              <h2 id="branding-heading">
                Made to be
                <br />
                remembered.
              </h2>
              <p>Selected logos and visual identities.</p>
            </div>
          </div>
          <BrandingGallery />
        </section>
        <section
          id="applications"
          className="application-section"
          aria-labelledby="applications-heading"
        >
          <div className="section-introduction section-content" data-reveal>
            <p className="eyebrow">(Creative technology)</p>
            <div>
              <h2 id="applications-heading">
                Ideas that
                <br />
                do more.
              </h2>
              <p>Applications, connected workflows, and useful tools.</p>
            </div>
          </div>
          <ProjectPanel project={applicationProject} application />
        </section>
        <section
          id="services"
          className="services section-content"
          aria-labelledby="services-heading"
        >
          <ServicesScroll services={services} />
        </section>
        <section
          id="about"
          className="about section-content"
          aria-labelledby="about-heading"
        >
          <div className="section-introduction" data-reveal>
            <p className="eyebrow">(About Trickfilm)</p>
            <div>
              <h2 id="about-heading">
                Creativity. Ingenuity.
                <br />
                Technology.
              </h2>
              <p className="about-copy">
                An independent creative studio making businesses look better,
                work smarter, and do more.
              </p>
              <p>
                From a new identity to a better way of working, we bring design
                and technology together to turn good ideas into working
                solutions.
              </p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
                Let’s make something good <Arrow />
              </a>
            </div>
          </div>
        </section>
        <section
          id="contact"
          className="contact-panel"
          aria-labelledby="contact-heading"
        >
          <div className="contact-layout">
            <div className="contact-introduction">
              <p className="eyebrow">(Let’s connect)</p>
              <h2 id="contact-heading">
                Have something
                <br />
                in mind?
              </h2>
              <a className="contact-direct" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
                <Arrow />
              </a>
            </div>
            <ContactForm />
          </div>
          <div className="contact-bottom">
            <p>Good ideas start with a conversation.</p>
            <a href="#intro">Back to top ↑</a>
          </div>
        </section>
      </main>
      <footer className="footer home-footer">
        <div className="footer-links">
          <a href="#work">Websites</a>
          <a href="#branding">Brand/Identity</a>
          <a href="#applications">Creative technology</a>
          <a href="#services">Services</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </div>
        <div className="footer-wordmark">
          <Image
            src="/brand/trickfilm-logo.svg"
            width={2000}
            height={451}
            alt="Trickfilm"
          />
        </div>
        <div className="footer-bottom">
          <span>© Trickfilm</span>
          <p>Independent creative studio.</p>
        </div>
      </footer>
    </>
  );
}
