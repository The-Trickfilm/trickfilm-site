import Image from "next/image";
import { Arrow } from "./arrow";
const projects = [
  {
    name: "Gower Modern Law",
    sector: "Legal services",
    domain: "gowermodernlaw.com",
    url: "https://gowermodernlaw.com/",
    image: "gower",
  },
  {
    name: "North Vancouver FC",
    sector: "Community sport",
    domain: "nvfc.ca",
    url: "https://nvfc.ca/",
    image: "nvfc",
  },
  {
    name: "Streamworks Designs",
    sector: "Water features & landscape design",
    domain: "streamworksdesigns.com",
    url: "https://www.streamworksdesigns.com/",
    image: "streamworks",
  },
  {
    name: "Access to Justice BC",
    sector: "Access to justice",
    domain: "accesstojusticebc.ca",
    url: "https://accesstojusticebc.ca/",
    image: "a2j",
  },
  {
    name: "StrataCouncil.ca",
    sector: "Strata council resources",
    domain: "stratacouncil.ca",
    url: "https://www.stratacouncil.ca/",
    image: "stratacouncil",
  },
];
export function SelectedWork() {
  return (
    <section
      className="selected-work section"
      id="work"
      aria-labelledby="work-title"
    >
      <div className="work-heading">
        <p className="eyebrow">01 / Selected work</p>
        <h2 id="work-title">
          Different businesses.
          <br />
          <span>Distinctive solutions.</span>
        </h2>
        <p>
          Selected websites by Trickfilm.
          <br />
          Built around the people they serve.
        </p>
      </div>
      <div className="project-grid">
        {projects.map((project, i) => (
          <a
            key={project.image}
            className={`project-card project-${project.image}`}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${project.name} website (opens in a new tab)`}
          >
            <div className="project-stage">
              <div className="project-screen">
                <div className="project-chrome" aria-hidden="true">
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{project.domain}</span>
                  <Arrow />
                </div>
                <Image
                  src={`/work/${project.image}.webp`}
                  width={1200}
                  height={833}
                  alt={`${project.name} homepage`}
                  sizes={
                    i < 2
                      ? "(max-width: 700px) 88vw, 44vw"
                      : "(max-width: 700px) 88vw, (max-width: 1000px) 44vw, 29vw"
                  }
                />
              </div>
              <span className="project-visit">
                Visit website <Arrow />
              </span>
            </div>
            <div className="project-meta">
              <div>
                <p>{project.sector}</p>
                <h3>{project.name}</h3>
              </div>
              <span className="project-arrow">
                <Arrow />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
