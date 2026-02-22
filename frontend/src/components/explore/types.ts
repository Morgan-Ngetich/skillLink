export type ViewType = "mentors" | "sessions" | "services";

export interface PriceRange {
  value: string;
  label: string;
  min: number;
  max: number;
}

export interface ExperienceLevel {
  value: string;
  label: string;
}

// src/pages/Explore/constants.ts
export const EXPERTISE_OPTIONS = [
  "AI/ML",
  "Product Management",
  "Software Engineering",
  "Design",
  "Data Science",
  "Marketing",
  "Leadership",
  "Career Development",
  "Entrepreneurship",
  "Sales",
] as const;

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid (3-5 years)" },
  { value: "senior", label: "Senior (6-10 years)" },
  { value: "lead", label: "Lead (10+ years)" },
];

export const PRICE_RANGES: PriceRange[] = [
  { value: "free", label: "Free", min: 0, max: 0 },
  { value: "0-50", label: "$0 - $50", min: 0, max: 50 },
  { value: "50-100", label: "$50 - $100", min: 50, max: 100 },
  { value: "100-200", label: "$100 - $200", min: 100, max: 200 },
  { value: "200+", label: "$200+", min: 200, max: Infinity },
];

export const SERVICE_CATEGORIES = [
  "Consulting",
  "Coaching",
  "Training",
  "Review",
  "Strategy",
] as const;