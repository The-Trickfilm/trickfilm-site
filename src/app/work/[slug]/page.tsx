import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  projects,
  creativeProjects,
  projectFrames,
  projectCategory,
  CONTACT_EMAIL,
} from "@/lib/projects";
import { LaptopPreview } from "@/components/laptop-preview";
import { Arrow } from "@/components/arrow";
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project?.name ?? "Project",
    description: project?.description,
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) notFound();
  const project = projects[index],
    next = projects[(index + 1) % projects.length],
    application = project.slug === "stratacouncil-platform",
    process = project.slug === "business-process-design",
    creative = creativeProjects.some((p) => p.slug === project.slug);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar case-topbar">
        <Link href="/" aria-label="Trickfilm home">
          <Image
            src="/brand/trickfilm-symbol.svg"
            width={52}
            height={51}
            alt="Trickfilm"
          />
        </Link>
        <Link href={creative ? "/#applications" : "/#work"}>
          ← Back to work
        </Link>
      </header>
      <main id="main">
        <section className="case-hero">
          <p className="eyebrow">
            ({creative ? "Creative solutions" : "Web design"})
          </p>
          <h1>{project.name}</h1>
          <dl className="case-facts">
            <div>
              <dt>Client / Product</dt>
              <dd>{project.name}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{projectCategory(project)}</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>{project.sector}</dd>
            </div>
          </dl>
        </section>
        <div className={`case-stage tone-${project.tone}`}>
          <LaptopPreview project={project} priority />
        </div>
        <section className="case-description">
          <h2>{application ? "A Trickfilm product." : "A closer look."}</h2>
          <div>
            <p>{project.description}</p>
            <a
              className="text-link"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {process
                ? "View full-size diagram"
                : application
                  ? "Explore the product"
                  : creative
                    ? "View full-size artwork"
                    : "Visit the website"}{" "}
              <Arrow />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            {projectFrames(project)
              .slice(1)
              .map((frame, i) => (
                <a
                  key={frame.src}
                  className="text-link case-artwork-link"
                  href={frame.src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View full-size artwork {i + 2}
                  <Arrow />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
          </div>
        </section>
        <Link className="case-next" href={`/work/${next.slug}`}>
          <p>Next project</p>
          <h2>
            {next.name}
            <Arrow />
          </h2>
        </Link>
      </main>
      <footer className="footer">
        <div className="footer-bottom">
          <Link href="/">Trickfilm</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </footer>
    </>
  );
}
