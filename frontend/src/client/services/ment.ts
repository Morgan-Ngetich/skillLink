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
  available: boolean;
};

export const mentors: Mentor[] = [
  {
    name: 'Fatima Ali',
    title: 'Product Manager · Startup Coach',
    skills: ['Product Strategy', 'Agile', 'Pitch Decks'],
    bio: 'Ex-Google PM mentoring early-stage founders.',
    rating: 5.0,
    reviews: 25,
    location: 'Toronto, Canada',
    tags: ["Backend", "FrontEnd"],
    rate: 'Free',
    photo: 'https://picsum.photos/id/1012/100',
    coverImage: 'https://picsum.photos/id/1016/400/200',
    available: true,
  },
  {
    name: 'David Kim',
    title: 'Software Architect · Tech Lead Mentor',
    skills: ['System Design', 'Backend', 'Scalability'],
    bio: 'Guiding senior engineers into tech leadership.',
    tags: ["Backend", "FrontEnd"],
    rating: 4.8,
    reviews: 40,
    location: 'Seoul, South Korea',
    rate: '$60/hr',
    photo: 'https://picsum.photos/id/1027/100',
    coverImage: 'https://picsum.photos/id/1022/400/200',
    available: true,
  },
  {
    name: 'Lara Singh',
    title: 'UX Designer · Career Coach',
    skills: ['UX/UI', 'Portfolio Reviews', 'Design Thinking'],
    bio: 'Helping designers land their first job in tech.',
    tags: ["Backend", "FrontEnd"],
    rating: 4.6,
    reviews: 14,
    location: 'Bangalore, India',
    rate: '$30/hr',
    photo: 'https://picsum.photos/id/1035/100',
    coverImage: 'https://picsum.photos/id/1032/400/200',
    available: false,
  },
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