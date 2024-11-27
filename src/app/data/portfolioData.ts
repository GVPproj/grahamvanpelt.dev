export interface PortfolioItemData {
  title: string
  description: string
  screenshot: string
  tooling: string[]
  url?: string
  repo?: string
  category?: string
}

export const portfolioItems: PortfolioItemData[] = [
  {
    title: "Tipbox.io",
    description:
      "A collaboration and workflow tool for the film and TV industries.",
    screenshot: "/images/tipboxThumb.webp",
    tooling: ["TypeScript", "React", "CSS"],
    url: "https://www.tipbox.io",
    category: "project",
  },
  {
    title: "A B&B Marketing Page",
    description:
      "Created with Gatsby, this perfomant marketing site features optimized images, speedy navigation, a nice gallery component and a phenomenal lighthouse score.",
    screenshot: "/images/port-bloom.webp",
    tooling: ["Gatsby", "React", "CSS"],
    repo: "https://github.com/GVPproj/bloom-bnb-gatsby",
    category: "personal",
  },
  {
    title: "A 'Linktree'-style React app",
    description:
      "A 'link-in-the-bio type page to link my Instagram followers to my various musical activities.",
    screenshot: "/images/port-links.webp",
    tooling: ["React", "Javascript", "CSS"],
    url: "https://links.grahamvanpelt.com",
    repo: "https://github.com/GVPproj/biolink-react",
    category: "personal",
  },
  {
    title: "A music festival page built with Astro",
    description:
      "A marketing page for an outdoor performance series that explores the relationship between nature, technology, and ourselves through immersive art experiences.",
    screenshot: "/images/port-groundwaves.webp",
    tooling: ["Astro", "React", "TailwindCSS"],
    url: "https://groundwaves.live",
    category: "personal",
  },
  {
    title: "An API-driven Quiz Game",
    description: "A trivia app pulling in questions from the OpenTrivia API.",
    screenshot: "/images/port-quizzical.webp",
    tooling: ["React", "CSS"],
    url: "https://gvp-react-quizzical.netlify.app/",
    repo: "https://github.com/GVPproj/react-trivia",
    category: "education",
  },
  {
    title: "A Javascript Dice Game",
    description:
      "Tenzies, a dice matching game with a timer and persistent high-score.",
    screenshot: "/images/port-tenzies.webp",
    tooling: ["HTML", "Javascript", "CSS"],
    url: "https://gvp-tenzies-react.netlify.app/",
    repo: "https://github.com/GVPproj/react-tenzies",
    category: "education",
  },
  {
    title: "A Javascript Colour Scheme Generator",
    description: "Find a colour palette for your next project.",
    screenshot: "/images/port-colour.webp",
    tooling: ["HTML", "Javascript", "CSS"],
    url: "https://gvpproj.github.io/colour-scheme-generator/",
    repo: "https://github.com/GVPproj/colour-scheme-generator",
    category: "education",
  },
]
