import Link from "next/link";
import { projectCategory, type Project } from "@/lib/projects";
import { LaptopPreview } from "./laptop-preview";
import { Arrow } from "./arrow";
export function ProjectPanel({
  project,
  creative = false,
}: {
  project: Project;
  creative?: boolean;
}) {
  const process = project.slug === "business-process-design";
  return (
    <article
      className={`project-panel tone-${project.tone}`}
      data-project-href={`/work/${project.slug}`}
    >
      {!creative && (
        <Link
          className="project-card-link"
          href={`/work/${project.slug}`}
          aria-label={`View ${project.name} website project`}
        />
      )}

      <div className="project-info" data-reveal>
        <p className="eyebrow">
          ({creative ? "Creative solutions" : "Web design"})
        </p>
        <h3>
          {creative && "service" in project ? (
            project.service
          ) : project.name === "StrataCouncil.ca" ? (
            <>
              <span className="project-name-part">Strata</span>
              <wbr />
              <span className="project-name-part">Council.ca</span>
            </>
          ) : (
            project.name
          )}
        </h3>
        {!creative && (
          <span className="project-cta">
            <span className="flower-accent">
              <Arrow />
            </span>
            <span>View project</span>
          </span>
        )}
        <dl className="project-facts">
          <div>
            <dt>Category:</dt>
            <dd>{projectCategory(project)}</dd>
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
        <LaptopPreview project={project} />
      </div>
    </article>
  );
}
