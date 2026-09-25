export type ProfileTheme = {
  bg: string;
  card: string;
  ink: string;
  sub: string;
  accent: string;
  chips: string;
};

export type Prompt = { label: string; answer: string };

export type Profile = {
  name: string;
  age: number;
  course: string;
  year: string;
  hometown: string;
  height?: string;
  languages: string;
  prompts: [Prompt, Prompt, Prompt];
  interests: string[];
  /** two-stop gradients for photo placeholders */
  photos: [[string, string], [string, string]];
};

export const THEMES = {
  rose: { bg: "#F7D6E0", card: "#FFF6F8", ink: "#4F1529", sub: "#8A3A56", accent: "#B83B64", chips: "#FBE6EC" },
  azure: { bg: "#D6E4F7", card: "#F5F9FF", ink: "#122B55", sub: "#35568C", accent: "#2F5FB3", chips: "#E4EDFA" },
} satisfies Record<string, ProfileTheme>;

export type ThemeKey = keyof typeof THEMES;

// Fictional sample people. Deliberately excludes intent, sexuality, religion,
// caste, politics, drinking/smoking and income.
export const PROFILES: Record<ThemeKey, Profile> = {
  rose: {
    name: "Riya",
    age: 20,
    course: "BCA",
    year: "2nd year",
    hometown: "Jaipur",
    languages: "Hindi, English",
    prompts: [
      { label: "Campus spot you'll find me at", answer: "Library window seat, pretending to study" },
      { label: "Green flag I look for", answer: "Remembers your chai order" },
      { label: "Best canteen order", answer: "Maggi, no debate" },
    ],
    interests: ["Music", "Photography", "Bollywood", "Coding", "Sketching"],
    photos: [
      ["#F4B8C8", "#F9E3C9"],
      ["#E9A6BF", "#D9C2F0"],
    ],
  },
  azure: {
    name: "Arjun",
    age: 21,
    course: "BBA",
    year: "3rd year",
    hometown: "Lucknow",
    height: "5′11″",
    languages: "Hindi, English",
    prompts: [
      { label: "My simple pleasures", answer: "Metro window seat and a good playlist" },
      { label: "We'll get along if", answer: "You have strong opinions on the best momos in West Delhi" },
      { label: "Unpopular opinion", answer: "8 a.m. lectures are underrated. Hear me out." },
    ],
    interests: ["Cricket", "Stand-up comedy", "Trekking", "Football", "Cooking"],
    photos: [
      ["#A9C3EE", "#D8E6F9"],
      ["#9DB4E6", "#C9E3E8"],
    ],
  },
};
