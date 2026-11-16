import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, projectPreview, CONTACT_EMAIL } from "@/lib/projects";
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
    creative = application || process,
    preview = projectPreview(project);
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
              <dd>
                {process
                  ? "Business process design"
                  : application
                    ? "Application"
                    : "Website"}
              </dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>{project.sector}</dd>
            </div>
          </dl>
        </section>
        <div className={`case-stage tone-${project.tone}`}>
          <div className="laptop">
            <div className="laptop-lid">
              <span className="camera" />
              <div
                className={`laptop-display${preview.contain ? " diagram-display" : ""}`}
              >
                <Image
                  src={preview.src}
                  width={preview.width}
                  height={preview.height}
                  alt={preview.alt}
                  priority
                  sizes="(max-width: 700px) 80vw, 75vw"
                />
              </div>
            </div>
            <div className="laptop-base">
              <span />
            </div>
          </div>
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
                  : "Visit the website"}{" "}
              <Arrow />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
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
