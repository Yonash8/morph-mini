export interface ContactInfo {
  location: string;
  phone: string;
  email: string;
  linkedin: string;
}

export type ContactField = 'location' | 'phone' | 'email' | 'linkedin';

export interface SectionOrder {
  order: ('experience' | 'projects')[];
}

export interface JobExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    role: string;
    summary: string;
  };
  contact: ContactInfo;
  contactOrder: ContactField[];
  expertise: string[];
  techStack: string[];
  education: Education[];
  experience: JobExperience[];
  projects: Project[];
  showProjects?: boolean;
  sectionTitles: {
    experience: string;
    projects: string;
    expertise: string;
    techStack: string;
  };
  sectionOrder: ('experience' | 'projects')[];
  metadata?: {
    dateCreated?: string;
    targetRole?: string;
    targetCompany?: string;
    targetLink?: string;
  };
  scale?: number; // Manual scale value (0-1), 0.5 is baseline
}

export const defaultResumeData: ResumeData = {
  personalInfo: {
    name: "David Cohen",
    role: "Product Manager",
    summary: "Product Manager with 5+ years of experience driving product strategy, roadmap execution, and cross-functional collaboration. Proven track record of launching successful products that drive user engagement and business growth. Passionate about understanding user needs and translating them into innovative solutions.",
  },
  contact: {
    location: "New York, NY",
    phone: "555-123-4567",
    email: "david.cohen@example.com",
    linkedin: "/david-cohen-pm",
  },
  contactOrder: ['location', 'phone', 'email', 'linkedin'],
  expertise: [
    "Product Strategy",
    "Roadmap Planning",
    "User Research",
    "Agile/Scrum",
    "Data Analysis",
    "Stakeholder Management",
    "A/B Testing",
    "Go-to-Market Strategy",
  ],
  techStack: [
    "Jira / Confluence",
    "Figma / Miro",
    "SQL / Tableau",
    "Google Analytics",
    "Mixpanel / Amplitude",
    "Productboard",
    "Notion / Asana",
  ],
  education: [
    {
      id: "edu-1",
      degree: "MBA, Product Management",
      institution: "Columbia Business School",
      startDate: "2016",
      endDate: "2018",
    },
    {
      id: "edu-2",
      degree: "BS, Computer Science",
      institution: "New York University",
      startDate: "2012",
      endDate: "2016",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "TechCorp Inc.",
      title: "Senior Product Manager",
      startDate: "Jan 2021",
      endDate: "Present",
      bullets: [
        "Led product strategy and roadmap for B2B SaaS platform, resulting in 40% increase in user engagement and $2M ARR growth.",
        "Collaborated with engineering, design, and marketing teams to launch 3 major product features, improving customer satisfaction scores by 25%.",
        "Conducted user research and data analysis to identify key pain points, leading to prioritization of features that drove 30% reduction in churn.",
        "Managed product backlog and sprint planning using Agile methodologies, ensuring on-time delivery of 95% of roadmap items.",
      ],
    },
    {
      id: "exp-2",
      company: "StartupXYZ",
      title: "Product Manager",
      startDate: "Mar 2019",
      endDate: "Dec 2020",
      bullets: [
        "Owned end-to-end product development lifecycle for mobile app, from ideation to launch, achieving 100K+ downloads in first 6 months.",
        "Defined product requirements and user stories, working closely with UX designers to create intuitive user experiences.",
        "Analyzed user behavior data and conducted A/B tests to optimize conversion funnels, increasing sign-up rates by 45%.",
        "Coordinated go-to-market strategy with marketing and sales teams, contributing to successful Series A fundraising round.",
      ],
    },
    {
      id: "exp-3",
      company: "Digital Solutions LLC",
      title: "Associate Product Manager",
      startDate: "Jun 2018",
      endDate: "Feb 2019",
      bullets: [
        "Supported product initiatives for web platform, assisting in feature prioritization and roadmap planning.",
        "Gathered and synthesized user feedback through surveys and interviews to inform product decisions.",
        "Created product documentation and user guides, improving internal knowledge sharing and onboarding processes.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "AI-Powered Recommendation Engine",
      description: "Led cross-functional team to develop and launch ML-based recommendation system that increased user engagement by 35% and average session duration by 20%. Worked with data science team to define model requirements and collaborated with engineering on implementation.",
    },
    {
      id: "proj-2",
      title: "Mobile App Redesign",
      description: "Spearheaded complete redesign of mobile application based on user research insights. Coordinated with design and engineering teams to deliver improved UX that resulted in 50% increase in daily active users and 4.5-star app store rating.",
    },
  ],
  showProjects: true,
  sectionTitles: {
    experience: "Professional Experience",
    projects: "Key Technical Projects",
    expertise: "Expertise",
    techStack: "Tech Stack",
  },
  sectionOrder: ['experience', 'projects'],
  metadata: {
    dateCreated: new Date().toISOString(),
    targetRole: "",
    targetCompany: "",
    targetLink: "",
  },
  scale: 0.5, // Baseline scale (0 = most compact, 1 = most expanded)
};
