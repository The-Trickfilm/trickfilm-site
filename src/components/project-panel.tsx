import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import { Arrow } from "./arrow";
export function ProjectPanel({
  project,
  application = false,
}: {
  project: Project;
  application?: boolean;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className={`project-panel tone-${project.tone}`}
      aria-label={`View ${project.name} ${application ? "application" : "website"} project`}
      data-reveal
    >
      <div className="project-info">
        <p className="eyebrow">
          ({application ? "Creative technology" : "Work"})
        </p>
        <h3>{project.name}</h3>
        <span className="project-cta">
          <span className="diamond">
            <Arrow />
          </span>
          <span>View project</span>
        </span>
        <dl className="project-facts">
          <div>
            <dt>Category:</dt>
            <dd>{application ? "Application" : "Website design"}</dd>
          </div>
          <div>
            <dt>Client:</dt>
            <dd>{project.name}</dd>
          </div>
          <div>
            <dt>Focus:</dt>
            <dd>{project.sector}</dd>
          </div>
        </dl>
      </div>
      <div className="project-visual">
        <div className="laptop">
          <div className="laptop-lid">
            <span className="camera" />
            <div className="laptop-display">
              <Image
                src={
                  application
                    ? "/work/applications/stratacouncil-meetings.webp"
                    : `/work/${project.image}.webp`
                }
                width={1200}
                height={833}
                sizes="(max-width: 700px) 82vw, 58vw"
                alt={
                  application
                    ? "Public StrataCouncil.ca meeting-tools preview"
                    : `${project.name} homepage`
                }
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
