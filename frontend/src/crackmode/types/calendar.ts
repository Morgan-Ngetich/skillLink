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
  ]

}
