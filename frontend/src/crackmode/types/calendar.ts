export interface LeetcodeProblem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
  docs: string;
  solved: boolean;
  solvedAt: string | null;
}

export type FilterType = "all" | "Easy" | "Medium" | "Hard" | "solved"


export const mockProblems: Record<string, LeetcodeProblem[]> = {
  "2025-08-26": [
    {
      id: 1,
      title: "Implement Stack using Queues",
      difficulty: "Easy",
      tags: ["Stack", "Design", "Queue"],
      url: "https://leetcode.com/problems/implement-stack-using-queues",
      docs: "/crackmode/docs/problems/implement-stack-using-queues",
      solved: true,
      solvedAt: "2025-08-26T22:00:00Z"
    },
  ],
  "2025-08-27": [
    {
      id: 1,
      title: "Longest Consecutive Sequence",
      difficulty: "Medium",
      tags: ["Array", "Hash Table", "Union Find"],
      url: "https://leetcode.com/problems/longest-consecutive-sequence",
      docs: "/crackmode/docs/problems/longest-consecutive-sequence",
      solved: true,
      solvedAt: "2025-08-26T22:00:00Z"
    }
  ],
  "2025-08-28": [
    {
      "id": 1,
      "title": "Missing Number",
      "difficulty": "Easy",
      "tags": ["Array", "Bit Manipulation", "Math"],
      "url": "https://leetcode.com/problems/missing-number",
      "docs": "/crackmode/docs/problems/missing-number",
      "solved": true,
      "solvedAt": "2025-08-28T23:00:00Z"
    }
  ],
  "2025-09-01": [
    {
      "id": 1,
      "title": "Check if Number Has Equal Digit Count and Digit Value",
      "difficulty": "Easy",
      "tags": ["String", "Hash Table", "Counting"],
      "url": "https://leetcode.com/problems/check-if-number-has-equal-digit-count-and-digit-value",
      "docs": "/crackmode/docs/problems/check-if-number-has-equal-digit-count-and-digit-value",
      "solved": true,
      "solvedAt": "2025-08-28T23:10:00Z"
    }
  ],
  "2025-09-02": [
    {
      "id": 1,
      "title": "Find the Difference of Two Arrays",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table", "Set"],
      "url": "https://leetcode.com/problems/find-the-difference-of-two-arrays/",
      "docs": "/crackmode/docs/problems/find-the-difference-of-two-arrays",
      "solved": true,
      "solvedAt": "2025-09-02T23:00:00Z"
    }
  ],
  "2025-09-03": [
    {
      "id": 1,
      "title": "Unique Number of Occurrences",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table"],
      "url": "https://leetcode.com/problems/unique-number-of-occurrences/",
      "docs": "/crackmode/docs/problems/unique-number-of-occurrences",
      "solved": true,
      "solvedAt": "2025-09-03T00:45:00Z"
    }
  ],
  "2025-09-04": [
    {
      "id": 1,
      "title": "Find the Difference",
      "difficulty": "Easy",
      "tags": ["HashTable", "String", "Bit Manipulation", "Sorting"],
      "url": "https://leetcode.com/problems/find-the-difference/",
      "docs": "/crackmode/docs/problems/find-the-difference",
      "solved": true,
      "solvedAt": "2025-09-03T00:45:00Z"
    },
  ]
}
