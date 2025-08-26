export interface LeetcodeProblem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
  solved: boolean;
  solvedAt: string | null;
}

export type FilterType = "all" | "Easy" | "Medium" | "Hard" | "solved"


export const mockProblems: Record<string, LeetcodeProblem[]> = {
  "2025-01-15": [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      tags: ["Array", "Hash Table"],
      url: "https://leetcode.com/problems/two-sum/",
      solved: true,
      solvedAt: "2025-01-15T10:30:00Z",
    },
  ],
  "2025-01-16": [
    {
      id: 2,
      title: "Add Two Numbers",
      difficulty: "Medium",
      tags: ["Linked List", "Math", "Recursion"],
      url: "https://leetcode.com/problems/add-two-numbers/",
      solved: true,
      solvedAt: "2025-01-16T14:20:00Z",
    },
  ],
  "2025-08-17": [
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      tags: ["Hash Table", "String", "Sliding Window"],
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      solved: true,
      solvedAt: "2025-01-17T16:45:00Z",
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      tags: ["Array", "Binary Search", "Divide and Conquer"],
      url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      solved: false,
      solvedAt: null,
    },
    {
      id: 5,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      tags: ["Hash Table", "String", "Sliding Window"],
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      solved: true,
      solvedAt: "2025-01-17T16:45:00Z",
    },
    {
      id: 6,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      tags: ["Array", "Binary Search", "Divide and Conquer"],
      url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      solved: false,
      solvedAt: null,
    },
  ],
}