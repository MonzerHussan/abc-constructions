export const PLATFORM_HOME = "/projects/ABC";
export const PLATFORM_LOGIN = "/projects/ABC?login=1";
export const PLATFORM_REGISTER = "/projects/ABC?register=1";
export const PLATFORM_PROJECTS = "/projects";
export const PLATFORM_SERVICES = "/services";
export const PLATFORM_MARKETPLACE = "/projects/ABC/marketplace";
export const PLATFORM_TENDERS = "/projects/ABC/tenders/projects";

export const WHATSAPP = "https://wa.me/971504241653";
export const PHONE = "tel:+971504241653";
export const EMAIL = "mailto:info@intelligentprojects.co";

export const HERO_SLIDES = [
  {
    image: "/assets/hero-1-CHsXjZiy.jpg",
    title: "Turn Ideas into Intelligent Realities",
    subtitle:
      "Empowering businesses with intelligent automation and cutting-edge AI solutions that redefine efficiency and innovation.",
  },
  {
    image: "/assets/hero-2-_c-4ndvZ.jpg",
    title: "AI Solutions & Automation",
    subtitle:
      "Transform your business with cutting-edge artificial intelligence and smart automation solutions that drive efficiency and innovation.",
  },
  {
    image: "/assets/hero-3-CCNOATX0.jpg",
    title: "E-commerce Excellence",
    subtitle:
      "We build smart, scalable, and high-converting e-commerce systems that turn visitors into loyal customers.",
  },
  {
    image: "/assets/hero-4-DReGx4HO.jpg",
    title: "Management Consultancy",
    subtitle:
      "Expert management consulting services to optimize your business operations, enhance leadership, and drive sustainable growth.",
  },
  {
    image: "/assets/hero-5-DBkdLmZG.jpg",
    title: "Marketing Consultancy",
    subtitle:
      "Data-driven marketing strategies and creative campaigns that amplify your brand and accelerate business growth.",
  },
  {
    image: "/assets/hero-6-DwPBvntb.jpg",
    title: "Investment Advisory",
    subtitle:
      "We turn insights into investments — guiding clients toward sustainable and intelligent financial success.",
  },
  {
    image: "/assets/hero-7-DzAiI_nw.jpg",
    title: "Commercial Brokerage",
    subtitle:
      "Expert commercial brokerage services facilitating business transactions, mergers, acquisitions, and strategic partnerships.",
  },
  {
    image: "/assets/hero-8-CJWG-uAo.jpg",
    title: "Your Success is Our Mission",
    subtitle:
      "Partner with us to unlock your business potential through innovative solutions, strategic guidance, and measurable growth.",
  },
];

export const SERVICES = [
  {
    slug: "ai-solutions-automation",
    image: "/assets/ai-solutions-C8IaWUsF.jpg",
    title: "AI Solutions & Automation",
    description:
      "Leverage cutting-edge AI to automate processes, enhance decision-making, and scale operations efficiently.",
    features: [
      "Process automation & workflow optimization",
      "AI-powered analytics and decision support",
      "Integration with existing business systems",
    ],
    href: PLATFORM_HOME,
  },
  {
    slug: "ecommerce-solutions",
    image: "/assets/ecommerce-BQudAQvV.jpg",
    title: "E-commerce Solutions",
    description:
      "End-to-end e-commerce solutions from setup to optimization, including marketplace integration and digital storefronts.",
    features: ["Store setup & customization", "Marketplace integration", "Conversion optimization"],
    href: PLATFORM_MARKETPLACE,
  },
  {
    slug: "management-consultancy",
    image: "/assets/management-consultancy-CFpoLCAk.jpg",
    title: "Management Consultancy",
    description:
      "Strategic business planning, process optimization, and operational excellence to drive growth and efficiency.",
    features: ["Strategic planning", "Process optimization", "Operational excellence"],
    href: PLATFORM_HOME,
  },
  {
    slug: "marketing-consultancy",
    image: "/assets/marketing-consultancy-C0OOP8Hi.jpg",
    title: "Marketing Consultancy",
    description:
      "Data-driven marketing strategies, digital campaigns, and brand positioning for maximum market impact.",
    features: ["Digital marketing strategy", "Brand positioning", "Campaign management"],
    href: PLATFORM_HOME,
  },
  {
    slug: "investment-advisory",
    image: "/assets/investment-advisory-D-V3q8fG.jpg",
    title: "Investment Advisory",
    description:
      "Expert guidance on investment opportunities, portfolio management, and strategic financial planning.",
    features: ["Investment opportunities", "Portfolio guidance", "Financial planning"],
    href: PLATFORM_HOME,
  },
  {
    slug: "commercial-brokerage",
    image: "/assets/commercial-brokerage-new-BJe3eiFu.jpg",
    title: "Commercial Brokerage",
    description:
      "Professional facilitation of business transactions, mergers, acquisitions, and strategic partnerships.",
    features: ["M&A facilitation", "Strategic partnerships", "Transaction advisory"],
    href: PLATFORM_HOME,
  },
];

export const PROJECT_CATEGORIES = [
  { image: "/assets/all-projects-D-dbCtak.jpg", title: "All Projects", href: PLATFORM_PROJECTS },
  { image: "/assets/completed-section-BCFc_sS0.jpg", title: "Completed", href: PLATFORM_PROJECTS },
  { image: "/assets/under-progress-section-BfP6jabl.jpg", title: "Under Progress", href: PLATFORM_PROJECTS },
  { image: "/assets/coming-soon-section-CTIxRVQ-.jpg", title: "Coming Soon", href: PLATFORM_PROJECTS },
  { image: "/assets/ideas-section-DnumP0nv.jpg", title: "Ideas", href: PLATFORM_PROJECTS },
];

export const VALUES = ["Innovation", "Integrity", "Excellence", "Partnership", "Growth"];

export const COMPANY_PROJECTS = [
  {
    slug: "ABC",
    title: "ABC",
    tagline: "Business & Tenders Platform",
    description:
      "ABC is the company's flagship all-in-one business platform: marketplaces, tenders & procurement, RFQs and quotations, research, training and much more — all in one place.",
    image: "/assets/all-projects-D-dbCtak.jpg",
    href: "/projects/ABC",
    status: "live" as const,
    details: [{ label: "Platform", value: "Web" }],
  },
  {
    slug: "wow",
    title: "WOW",
    tagline: "E-commerce & Consumer Experience",
    description:
      "An upcoming e-commerce venture focused on a seamless, tech-enabled consumer experience. Link will be added once the project goes live.",
    image: "/assets/ecommerce-BQudAQvV.jpg",
    href: "#",
    status: "coming-soon" as const,
    details: [{ label: "Status", value: "Coming Soon" }],
  },
  {
    slug: "sakeenah",
    title: "Sakeenah",
    tagline: "Living & Community",
    description:
      "An upcoming community and lifestyle project. Link will be added once the project goes live.",
    image: "/assets/coming-soon-section-CTIxRVQ-.jpg",
    href: "#",
    status: "coming-soon" as const,
    details: [{ label: "Status", value: "Coming Soon" }],
  },
];

export const QUICK_LINKS = [
  { label: "Home", href: PLATFORM_HOME },
  { label: "About Us", href: PLATFORM_HOME },
  { label: "Our Services", href: PLATFORM_HOME },
  { label: "Our Projects", href: PLATFORM_PROJECTS },
  { label: "Contact Us", href: PLATFORM_HOME },
];

export const FOOTER_SERVICES = [
  { label: "AI Solutions & Automation", href: PLATFORM_HOME },
  { label: "E-commerce Solutions", href: PLATFORM_MARKETPLACE },
  { label: "Commercial Brokerage", href: PLATFORM_HOME },
  { label: "Investment Advisory", href: PLATFORM_HOME },
  { label: "Management Consultancy", href: PLATFORM_HOME },
  { label: "Marketing Consultancy", href: PLATFORM_HOME },
];

export const LEGAL_LINKS = [
  { label: "Privacy Policy", href: PLATFORM_HOME },
  { label: "Refund & Return Policy", href: PLATFORM_HOME },
  { label: "Terms & Conditions", href: PLATFORM_HOME },
];

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/intelligent-projects-17231332a" },
  { label: "X (Twitter)", href: "https://x.com/IntelligenttPro" },
  { label: "Facebook", href: "https://www.facebook.com/share/1FtXmoERgq/?mibextid=wwXIfr" },
  { label: "Instagram", href: "https://www.instagram.com/intelligent__projects" },
  { label: "TikTok", href: "https://www.tiktok.com/@intelligent__projects" },
  { label: "Snapchat", href: "https://www.snapchat.com/add/intelliproject" },
  { label: "YouTube", href: "https://www.youtube.com/@IntelligentProjects-v5n" },
];