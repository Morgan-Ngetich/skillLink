// MENT means both mentee and mentor

export type Mentor = {
  name: string;
  title: string;
  skills: string[];
  bio: string;
  tags: string[];
  rating: number;
  reviews: number;
  location: string;
  rate: string;
  photo: string;
  coverImage: string;
  sessions: number;
  available: boolean;
  badges: string[];
};

export const mentors: Mentor[] = [
  {
    name: 'Fatima Ali',
    title: 'Product Manager · Startup Coach',
    skills: ['Product Strategy', 'Agile', 'Pitch Decks', 'Growth Hacking'],
    bio: 'Ex-Google PM with 8 years experience mentoring early-stage founders. Specialized in SaaS products.',
    rating: 5.0,
    reviews: 42,
    location: 'Toronto, Canada',
    tags: ["Top Mentor", "Live Session", "Staff Pick", "Startup Specialist", "Featured"],
    rate: 'Free',
    photo: 'https://picsum.photos/id/1012/100',
    coverImage: 'https://picsum.photos/id/1016/400/200',
    available: false,
    sessions: 120,
    badges: ["Ex-Google", "Y Combinator Advisor"]
  },
  {
    name: 'David Kim',
    title: 'Software Architect · Tech Lead Mentor',
    skills: ['System Design', 'Backend', 'Scalability', 'Cloud Architecture', 'DevOps'],
    bio: '15+ years experience guiding senior engineers into tech leadership roles at FAANG companies.',
    tags: ["Top Rated", "Instant Booking", "Community Favorite", "Open for 1:1"],
    rating: 4.9,
    reviews: 87,
    location: 'Seoul, South Korea',
    rate: '$120/hr',
    photo: 'https://picsum.photos/id/1027/100',
    coverImage: 'https://picsum.photos/id/1022/400/200',
    available: true,
    sessions: 320,
    badges: ["Ex-Meta", "Conference Speaker"]
  },
  {
    name: 'Lara Singh',
    title: 'UX Lead · Career Coach',
    skills: ['UX/UI', 'Portfolio Reviews', 'Design Thinking', 'Figma', 'User Research'],
    bio: 'Former Head of Design at Spotify helping designers land jobs at top tech companies.',
    tags: ["Live Now", "Hiring Manager", "Trending", "Workshop Host"],
    rating: 4.8,
    reviews: 56,
    location: 'Bangalore, India',
    rate: '$80/hr',
    photo: 'https://picsum.photos/id/1035/100',
    coverImage: 'https://picsum.photos/id/1032/400/200',
    available: false,
    sessions: 210,
    badges: ["Ex-Spotify", "Design Jury"]
  },
  {
    name: 'Marcus Johnson',
    title: 'Data Science Lead · AI Mentor',
    skills: ['Machine Learning', 'LLMs', 'Python', 'Data Visualization', 'R'],
    bio: 'Building AI products since 2015. Mentor at DeepLearning.AI and Kaggle Grandmaster.',
    tags: ["Top Mentor", "Flash Sale", "Course Author", "AI Specialist"],
    rating: 5.0,
    reviews: 134,
    location: 'San Francisco, USA',
    rate: '$150/hr',
    photo: 'https://picsum.photos/id/177/100',
    coverImage: 'https://picsum.photos/id/180/400/200',
    available: true,
    sessions: 450,
    badges: ["Kaggle Grandmaster", "Published Author"]
  }
];

export type Project = {
  id: number;
  title: string;
  category: string;
  task: string;
  progress: number;
  deadline: string;
  url: string;
  todayFocus: boolean;
  mentors: {
    name: string;
    photo: string;
  }[];
};


export const fakeProjects: Project[] = [
  {
    id: 1,
    title: '500 LeetCode Questions',
    category: 'Coding',
    task: 'Solve 200 Easy',
    progress: 60,
    deadline: '2025-08-30',
    url: 'https://leetcode.com/problemset/all/',
    todayFocus: true,
    mentors: [
      { name: 'Alice', photo: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', photo: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', photo: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
  {
    id: 2,
    title: 'Startup MVP - Braidify',
    category: 'Startup',
    task: 'Finalize Pricing Engine',
    progress: 45,
    deadline: '2025-08-10',
    url: 'https://github.com/braidify/mvp-core',
    todayFocus: false,
    mentors: [
      { name: 'Alice', photo: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', photo: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', photo: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
  {
    id: 3,
    title: 'DSA Class Site',
    category: 'Career',
    task: 'Wireframe Curriculum',
    progress: 80,
    deadline: '2025-08-05',
    url: 'https://figma.com/file/example-dsa-design',
    todayFocus: false,
    mentors: [
      { name: 'Alice', photo: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', photo: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', photo: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
  {
    id: 4,
    title: 'DSA Class Site',
    category: 'Career',
    task: 'Wireframe Curriculum',
    progress: 80,
    deadline: '2025-08-05',
    url: 'https://figma.com/file/example-dsa-design',
    todayFocus: true,
    mentors: [
      { name: 'Alice', photo: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', photo: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', photo: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
];