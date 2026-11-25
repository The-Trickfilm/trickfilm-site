import Image from "next/image";
import { projectFrames, type Project } from "@/lib/projects";
import { ScreenSlideshow } from "./screen-slideshow";

export function LaptopPreview({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const frames = projectFrames(project),
    preview = frames[0];
  return (
    <div className="laptop">
      <div className="laptop-lid">
        <span className="camera" />
        {frames.length > 1 ? (
          <ScreenSlideshow
            frames={frames}
            name={project.name}
            priority={priority}
            intervalMs={
              "slideIntervalMs" in project ? project.slideIntervalMs : 3000
            }
            darkBackground={
              project.slug === "thunderbird-entertainment" ||
              project.slug === "stratacouncil-platform"
            }
          />
        ) : (
          <div
            className={`laptop-display${preview.contain ? " diagram-display" : ""}`}
          >
            <Image
              src={preview.src}
              width={preview.width}
              height={preview.height}
              alt={preview.alt}
              priority={priority}
              sizes="(max-width: 700px) 82vw, 58vw"
            />
          </div>
        )}
      </div>
      <div className="laptop-base">
        <span />
      </div>
    </div>
  );
}
