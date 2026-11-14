"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Arrow } from "./arrow";
const content = [
  {
    name: "Web design",
    headline: "Make the right first impression.",
    body: "A clear story. An intuitive experience. A website that gives people a reason to take the next step.",
    tags: [
      "Strategy & structure",
      "Design & development",
      "Performance & accessibility",
    ],
    example:
      "Your website has grown, but the story has become harder to follow.",
    theme: "web",
  },
  {
    name: "Workflow automation",
    headline: "Give good people their time back.",
    body: "Connect the steps between your tools and teams, so work moves forward with fewer handoffs and less repeat admin.",
    tags: ["Process mapping", "Connected tools", "Thoughtful automation"],
    example: "The same information gets copied into three different places.",
    theme: "flow",
  },
  {
    name: "Custom applications",
    headline: "A better fit for the way you work.",
    body: "When spreadsheets and off-the-shelf tools stop fitting, build a focused application around the work your business actually does.",
    tags: [
      "Business applications",
      "Useful interfaces",
      "Connected information",
    ],
    example:
      "Your team has built a business-critical process around a spreadsheet.",
    theme: "app",
  },
  {
    name: "AI consulting",
    headline: "Find the useful in the possible.",
    body: "Understand where AI can help, where human judgment matters, and what a practical first step could look like.",
    tags: [
      "Opportunity assessment",
      "Practical experiments",
      "Human oversight",
    ],
    example: "You see the potential of AI, but need a clear place to start.",
    theme: "ai",
  },
];
function ServiceArtwork({ theme }: { theme: string }) {
  return (
    <div className={`service-art ${theme}`} aria-hidden="true">
      <span className="art-caption">A clearer way forward</span>
      {theme === "web" ? (
        <div className="art-browser">
          <div className="browser-bar">
            <i />
            <i />
            <i />
            <span>A fresh perspective</span>
          </div>
          <div className="browser-page">
            <span className="art-micro">Your next chapter</span>
            <p>
              Make room
              <br />
              for <em>better.</em>
            </p>
            <span className="art-small-button">
              Find your direction <Arrow />
            </span>
            <Image
              src="/brand/trickfilm-symbol.svg"
              width={220}
              height={215}
              alt=""
            />
          </div>
        </div>
      ) : theme === "flow" ? (
        <div className="art-flow">
          <span className="flow-line" />
          <div>
            <span className="flow-step">01</span>
            <p>A new enquiry</p>
            <span className="flow-status">Received</span>
          </div>
          <div>
            <span className="flow-step">02</span>
            <p>The right people</p>
            <span className="flow-status">Connected</span>
          </div>
          <div>
            <span className="flow-step">03</span>
            <p>A clear next step</p>
            <span className="flow-status">Ready</span>
          </div>
          <p className="art-flow-note">Less repetition. More momentum.</p>
        </div>
      ) : theme === "app" ? (
        <div className="art-app">
          <div className="app-side">
            <span className="app-brand">
              Workspace <span>●</span>
            </span>
            <span className="app-selected">Overview</span>
            <span>Projects</span>
            <span>People</span>
            <span>Documents</span>
          </div>
          <div className="app-main">
            <span className="art-micro">Your work, connected</span>
            <p>
              Everything
              <br />
              in its place.
            </p>
            <div className="app-task">
              <span className="task-check">✓</span> Project brief{" "}
              <span>Ready</span>
            </div>
            <div className="app-task">
              <span className="task-check">✓</span> Team handoff{" "}
              <span>Ready</span>
            </div>
            <div className="app-task">
              <span className="task-open" /> Next steps <span>In view</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="art-ai">
          <Image
            src="/brand/trickfilm-symbol.svg"
            width={220}
            height={215}
            alt=""
          />
          <p>
            Better questions.
            <br />
            <em>Useful answers.</em>
          </p>
          <span>Human judgment. New possibilities.</span>
        </div>
      )}
      <span className="art-disclosure">
        Illustrative concept · {content.find((s) => s.theme === theme)?.name}
      </span>
    </div>
  );
}
export function ServiceExplorer() {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onHash = () => {
      const match = location.hash.match(/^#service-0([1-4])$/);
      if (match) setActive(Number(match[1]) - 1);
    };
    const frame = requestAnimationFrame(onHash);
    addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("hashchange", onHash);
    };
  }, []);
  return (
    <div className="service-explorer">
      <div
        className="service-options"
        role="tablist"
        aria-label="Explore our services"
        aria-orientation="vertical"
        ref={list}
        onKeyDown={(event) => {
          let next = active;
          if (event.key === "ArrowDown") next = (active + 1) % 4;
          else if (event.key === "ArrowUp") next = (active + 3) % 4;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = 3;
          else return;
          event.preventDefault();
          setActive(next);
          list.current?.querySelectorAll("button")[next].focus();
        }}
      >
        {content.map((service, i) => (
          <button
            key={service.name}
            id={`service-0${i + 1}`}
            role="tab"
            aria-selected={active === i}
            aria-controls={`panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
          >
            <span className="service-number">0{i + 1}</span>
            <span>{service.name}</span>
            <span className="service-arrow">
              <Arrow />
            </span>
          </button>
        ))}
      </div>
      <div className="service-presentation">
        {content.map((service, i) => (
          <div
            key={service.name}
            role="tabpanel"
            id={`panel-${i}`}
            aria-labelledby={`service-0${i + 1}`}
            hidden={active !== i}
            tabIndex={0}
          >
            <ServiceArtwork theme={service.theme} />
            <div className="service-description">
              <h3>{service.headline}</h3>
              <p>{service.body}</p>
              <ul>
                {service.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <p className="starting-point">
                <span>A familiar challenge?</span> {service.example}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
