import Image from "next/image";
import Link from "next/link";
import { projectPreview, type Project } from "@/lib/projects";
import { Arrow } from "./arrow";
export function ProjectPanel({
  project,
  creative = false,
}: {
  project: Project;
  creative?: boolean;
}) {
  const preview = projectPreview(project);
  const process = project.slug === "business-process-design";
  return (
    <Link
      href={`/work/${project.slug}`}
      className={`project-panel tone-${project.tone}`}
      aria-label={`View ${project.name} ${creative ? "creative" : "website"} project`}
    >
      <div className="project-info" data-reveal>
        <p className="eyebrow">
          ({creative ? "Creative solutions" : "Web design"})
        </p>
        <h3>
          {project.name === "StrataCouncil.ca" ? (
            <>
              <span className="project-name-part">Strata</span>
              <wbr />
              <span className="project-name-part">Council.ca</span>
            </>
          ) : (
            project.name
          )}
        </h3>
        <span className="project-cta">
          <span className="flower-accent">
            <Arrow />
          </span>
          <span>View project</span>
        </span>
        <dl className="project-facts">
          <div>
            <dt>Category:</dt>
            <dd>
              {process
                ? "Business process design"
                : creative
                  ? "Application"
                  : "Website design"}
            </dd>
          </div>
          {!process && (
            <div>
              <dt>Client:</dt>
              <dd>{project.name}</dd>
            </div>
          )}
          <div>
            <dt>Focus:</dt>
            <dd>{project.sector}</dd>
          </div>
        </dl>
      </div>
      <div className="project-visual" data-reveal>
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
                sizes="(max-width: 700px) 82vw, 58vw"
                alt={preview.alt}
              />
            </div>
          </div>
          <div className="laptop-base">
            <span />
          </div>
        </div>
      </div>
    </Link>
  );
}
