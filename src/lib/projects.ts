export const websiteProjects = [
  {
    slug: "gower-modern-law",
    name: "Gower Modern Law",
    image: "gower",
    sector: "Legal services",
    domain: "gowermodernlaw.com",
    url: "https://gowermodernlaw.com/",
    tone: "teal",
    description: "An online presence for Gower Modern Law.",
  },
  {
    slug: "north-vancouver-fc",
    name: "North Vancouver FC",
    image: "nvfc",
    sector: "Community sport",
    domain: "nvfc.ca",
    url: "https://nvfc.ca/",
    tone: "paper",
    description: "A community football club, brought together online.",
  },
  {
    slug: "streamworks-designs",
    name: "Streamworks Designs",
    image: "streamworks",
    sector: "Water features & landscape design",
    domain: "streamworksdesigns.com",
    url: "https://www.streamworksdesigns.com/",
    tone: "charcoal",
    description:
      "A website for Streamworks Designs and its water features and landscape work.",
  },
  {
    slug: "access-to-justice-bc",
    name: "Access to Justice BC",
    image: "a2j",
    sector: "Access to justice",
    domain: "accesstojusticebc.ca",
    url: "https://accesstojusticebc.ca/",
    tone: "paper",
    description: "A website for Access to Justice BC.",
  },
  {
    slug: "koan-analytics",
    name: "Koan Analytics",
    image: "koan",
    sector: "Enterprise analytics",
    domain: "koananalytics.com",
    url: "https://koananalytics.com/we-build-end-to-end-analytic-platforms/",
    tone: "charcoal",
    description:
      "A website for Koan Analytics and its enterprise analytics platform.",
  },
  {
    slug: "stratacouncil",
    name: "StrataCouncil.ca",
    image: "stratacouncil",
    sector: "Strata council resources",
    domain: "stratacouncil.ca",
    url: "https://www.stratacouncil.ca/",
    tone: "teal",
    description:
      "The public website for StrataCouncil.ca, a Trickfilm product.",
  },
] as const;
export const applicationProject = {
  slug: "stratacouncil-platform",
  name: "StrataCouncil.ca",
  image: "stratacouncil",
  sector: "Council training, meetings & records",
  domain: "stratacouncil.ca",
  url: "https://www.stratacouncil.ca/",
  tone: "paper",
  description:
    "A Trickfilm product bringing council training, meeting tools, and institutional memory together.",
} as const;
export const processProject = {
  slug: "business-process-design",
  name: "Business Process Design",
  image: "processes/business-process",
  sector: "Data ingestion, analysis & reporting",
  domain: "Process diagram",
  url: "/work/processes/business-process.png",
  tone: "teal",
  category: "Business process design",
  description:
    "A process map connecting data sources, analysis, and reporting in one end-to-end workflow.",
} as const;
export const talentProject = {
  slug: "talent-creative-hr",
  name: "Talent Creative HR",
  image: "solutions/talent-creative-hr-process",
  sector: "HR process & employee retention",
  domain: "Process artwork",
  url: "/work/solutions/talent-creative-hr-process.webp",
  tone: "paper",
  category: "Process design",
  description:
    "HR process and employee-retention stages, presented as two complementary views.",
  previews: [
    {
      src: "/work/solutions/talent-creative-hr-process.webp",
      width: 1095,
      height: 1095,
      alt: "Talent Creative HR circular process map covering sourcing, alignment, development, and reward.",
      contain: true,
    },
    {
      src: "/work/solutions/talent-creative-hr-stages.webp",
      width: 2552,
      height: 1897,
      alt: "Employee-retention stages: research and benchmarking, team involvement, program design and implementation, company-wide communication, and evaluation and iteration.",
      contain: true,
    },
  ],
} as const;
export const thunderbirdProject = {
  slug: "thunderbird-entertainment",
  name: "Thunderbird Entertainment",
  image: "solutions/thunderbird-investor-deck",
  sector: "Investor communications",
  domain: "Presentation artwork",
  url: "/work/solutions/thunderbird-investor-deck.webp",
  tone: "charcoal",
  category: "Presentation design",
  description: "Corporate presentation artwork for Thunderbird Entertainment.",
  previews: [
    {
      src: "/work/solutions/thunderbird-investor-deck.webp",
      width: 1280,
      height: 720,
      alt: "Thunderbird Entertainment corporate presentation cover with a red city skyline.",
      contain: true,
    },
  ],
} as const;
export const creativeProjects = [
  applicationProject,
  processProject,
  talentProject,
  thunderbirdProject,
];
export const projects = [...websiteProjects, ...creativeProjects];
export type Project = (typeof projects)[number];
export type ProjectFrame = {
  src: string;
  width: number;
  height: number;
  alt: string;
  contain: boolean;
};
export function projectFrames(project: Project): readonly ProjectFrame[] {
  return "previews" in project ? project.previews : [projectPreview(project)];
}
export function projectCategory(project: Project) {
  return "category" in project
    ? project.category
    : project.slug === "stratacouncil-platform"
      ? "Application"
      : "Website design";
}
export function projectPreview(project: Project): ProjectFrame {
  if ("previews" in project) return project.previews[0];
  if (project.slug === "business-process-design")
    return {
      src: project.url,
      width: 1401,
      height: 851,
      alt: "Business process map connecting data sources, ingestion, segmentation, analysis, and reporting.",
      contain: true,
    };
  return {
    src:
      project.slug === "stratacouncil-platform"
        ? "/work/applications/stratacouncil-meetings.webp"
        : `/work/${project.image}.webp`,
    width: 1200,
    height: 833,
    alt:
      project.slug === "stratacouncil-platform"
        ? "Public StrataCouncil.ca meeting-tools preview"
        : `${project.name} website preview`,
    contain: false,
  };
}
export const CONTACT_EMAIL = "jeremy@trickfilm.com";
