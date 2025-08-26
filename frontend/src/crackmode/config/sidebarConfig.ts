import type { DocSection } from "../types/docs"

export const sidebarConfig: DocSection[] = [
  {
    title: "Introduction",
    links: [
      { title: "What is Crackmode?", href: "/crackmode/docs#welcome-to-crackmode" },
      // { title: "Getting Started", href: "/docs/introduction/getting-started" },
      // { title: "How to Use This Platform", href: "/docs/introduction/how-to-use" }
    ]
  },
  {
    title: "LeetCode 75",
    links: [
      {
        title: "What is Leetcode75",
        href: "/crackmode/docs/leetcode75/"
      },
      {
        title: "Arrays & Strings",
        href: "/crackmode/docs/leetcode75/arrays-strings",
        children: [
          { title: "Introduction", href: "/crackmode/docs/leetcode75/arrays-strings" },
          { title: "Merge Strings Alternately", href: "/crackmode/docs/leetcode75/arrays-strings/merge-strings-alternately" },
          { title: "GCD of Strings", href: "/crackmode/docs/leetcode75/arrays-strings/gcd-of-strings" },
          { title: "Kids With Greatest Candies", href: "/crackmode/docs/leetcode75/arrays-strings/kids-with-greatest-candies" },
          { title: "Product of Array Except Self", href: "/crackmode/docs/leetcode75/arrays-strings/product-of-array-except-self" },
          { title: "Increasing Triplet Subsequence", href: "/crackmode/docs/leetcode75/arrays-strings/increasing-triplet-subsequence" },
          { title: "String Compression", href: "/crackmode/docs/leetcode75/arrays-strings/string-compression" },
        ],
      },
      { title: "Linked Lists", href: "/docs/leetcode75/linked-lists" },
      { title: "Trees & Graphs", href: "/docs/leetcode75/trees-graphs" },
      { title: "Dynamic Programming", href: "/docs/leetcode75/dynamic-programming" },
      { title: "Binary Search", href: "/docs/leetcode75/binary-search" },
      { title: "Intervals", href: "/docs/leetcode75/intervals" },
      { title: "Backtracking", href: "/docs/leetcode75/backtracking" },
      { title: "Stack & Queue", href: "/docs/leetcode75/stack-queue" },
      { title: "Heap / Priority Queue", href: "/docs/leetcode75/heap" }
    ]
  },
  {
    title: "System Design",
    links: [
      { title: "Basics of System Design", href: "/docs/system-design/basics" },
      { title: "Scalability & Load Balancing", href: "/docs/system-design/scalability" },
      { title: "Databases & Storage", href: "/docs/system-design/databases" },
      { title: "Caching Strategies", href: "/docs/system-design/caching" },
      { title: "Message Queues & Events", href: "/docs/system-design/message-queues" },
      { title: "Case Studies", href: "/docs/system-design/case-studies" }
    ]
  },
  {
    title: "Patterns",
    links: [
      { title: "Two Pointers", href: "/docs/patterns/two-pointers" },
      { title: "Sliding Window", href: "/docs/patterns/sliding-window" },
      { title: "Binary Search Patterns", href: "/docs/patterns/binary-search" },
      { title: "DFS / BFS", href: "/docs/patterns/dfs-bfs" },
      { title: "Greedy Algorithms", href: "/docs/patterns/greedy" },
      { title: "Divide & Conquer", href: "/docs/patterns/divide-conquer" },
      { title: "DP Patterns", href: "/docs/patterns/dp-patterns" }
    ]
  },
  {
    title: "Interview Prep",
    links: [
      { title: "Behavioral Questions", href: "/docs/interview/behavioral" },
      { title: "Mock Interviews", href: "/docs/interview/mock-interviews" },
      { title: "Resume & Portfolio Tips", href: "/docs/interview/resume-portfolio" },
      { title: "FAANG / Top Tech Guides", href: "/docs/interview/faang-guides" }
    ]
  },
  {
    title: "Resources",
    links: [
      { title: "Roadmaps", href: "/docs/resources/roadmaps" },
      { title: "Cheat Sheets", href: "/docs/resources/cheat-sheets" },
      { title: "Books & Courses", href: "/docs/resources/books-courses" },
      { title: "Tools & Extensions", href: "/docs/resources/tools" }
    ]
  },
  {
    title: "Community",
    links: [
      { title: "Join Crackmode Sessions", href: "/docs/community/sessions" },
      { title: "Discussion Forum", href: "/docs/community/forum" },
      { title: "Contribute to Docs", href: "/docs/community/contribute" }
    ]
  }
]