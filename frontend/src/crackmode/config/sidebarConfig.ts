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
      { title: "Linked Lists", href: "/crackmode/docs/leetcode75/linked-lists" },
      { title: "Trees & Graphs", href: "/crackmode/docs/leetcode75/trees-graphs" },
      { title: "Dynamic Programming", href: "/crackmode/docs/leetcode75/dynamic-programming" },
      { title: "Binary Search", href: "/crackmode/docs/leetcode75/binary-search" },
      { title: "Intervals", href: "/crackmode/docs/leetcode75/intervals" },
      { title: "Backtracking", href: "/crackmode/docs/leetcode75/backtracking" },
      { title: "Stack & Queue", href: "/crackmode/docs/leetcode75/stack-queue" },
      { title: "Heap / Priority Queue", href: "/crackmode/docs/leetcode75/heap" }
    ]
  },
  {
    title: "Problems",
    links: [
      { title: "Implement Stack using Queues", href: "/crackmode/docs/problems/implement-stack-using-queues" },
      { title: "Longest Consecutive Sequence", href: "/crackmode/docs/problems/longest-consecutive-sequence" },
      { title: "Missing Number", href: "/crackmode/docs/problems/missing-number" },
      { title: "Check if Number Has Equal Digit Count and Digit Value", href: "/crackmode/docs/problems/check-if-number-has-equal-digit-count-and-digit-value" },
      
    ]
  },
  {
    title: "System Design",
    links: [
      { title: "Basics of System Design", href: "/crackmode//docs/system-design/basics" },
      { title: "Scalability & Load Balancing", href: "/crackmode//docs/system-design/scalability" },
      { title: "Databases & Storage", href: "/crackmode//docs/system-design/databases" },
      { title: "Caching Strategies", href: "/crackmode//docs/system-design/caching" },
      { title: "Message Queues & Events", href: "/crackmode//docs/system-design/message-queues" },
      { title: "Case Studies", href: "/crackmode//docs/system-design/case-studies" }
    ]
  },
  {
    title: "Patterns",
    links: [
      { title: "Two Pointers", href: "/crackmode/docs/patterns/two-pointers" },
      { title: "Sliding Window", href: "/crackmode/docs/patterns/sliding-window" },
      { title: "Binary Search Patterns", href: "/crackmode/docs/patterns/binary-search" },
      { title: "DFS / BFS", href: "/crackmode/docs/patterns/dfs-bfs" },
      { title: "Greedy Algorithms", href: "/crackmode/docs/patterns/greedy" },
      { title: "Divide & Conquer", href: "/crackmode/docs/patterns/divide-conquer" },
      { title: "DP Patterns", href: "/crackmode/docs/patterns/dp-patterns" }
    ]
  },
  {
    title: "Interview Prep",
    links: [
      { title: "Behavioral Questions", href: "/crackmode/docs/interview/behavioral" },
      { title: "Mock Interviews", href: "/crackmode/docs/interview/mock-interviews" },
      { title: "Resume & Portfolio Tips", href: "/crackmode/docs/interview/resume-portfolio" },
      { title: "FAANG / Top Tech Guides", href: "/crackmode/docs/interview/faang-guides" }
    ]
  },
  {
    title: "Resources",
    links: [
      { title: "Roadmaps", href: "/crackmode/docs/resources/roadmaps" },
      { title: "Cheat Sheets", href: "/crackmode/docs/resources/cheat-sheets" },
      { title: "Books & Courses", href: "/crackmode/docs/resources/books-courses" },
      { title: "Tools & Extensions", href: "/crackmode/docs/resources/tools" }
    ]
  },
  {
    title: "Community",
    links: [
      { title: "Join Crackmode Sessions", href: "/crackmode/docs/community/sessions" },
      { title: "Discussion Forum", href: "/crackmode/docs/community/forum" },
      { title: "Contribute to Docs", href: "/crackmode/docs/community/contribute" }
    ]
  }
]