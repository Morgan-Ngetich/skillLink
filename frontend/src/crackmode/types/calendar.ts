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
      "solvedAt": "2025-09-07T20:00:00Z"
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
      "solvedAt": "2025-09-07T20:00:00Z"
    },
  ],
  "2025-09-05": [
    {
      "id": 1,
      "title": "Find All Numbers Disappeared in an Array",
      "difficulty": "Easy",
      "tags": ["Array", "HashTable"],
      "url": "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/",
      "docs": "/crackmode/docs/problems/find-all-numbers-disappeared-in-an-array",
      "solved": true,
      "solvedAt": "2025-09-07T20:00:00Z"
    },
    {
      "id": 1,
      "title": "Find All Duplicates in an Array",
      "difficulty": "Medium",
      "tags": ["Array", "HashTable"],
      "url": "https://leetcode.com/problems/find-all-duplicates-in-an-array/",
      "docs": "/crackmode/docs/problems/find-all-duplicates-in-an-array",
      "solved": true,
      "solvedAt": "2025-09-07T20:00:00Z"
    }
  ],
  "2025-09-08": [
    {
      "id": 1,
      "title": "Number of Good Pairs",
      "difficulty": "Easy",
      "tags": ["Array", "HashTable", "Math", "Counting"],
      "url": "https://leetcode.com/problems/number-of-good-pairs/",
      "docs": "/crackmode/docs/problems/number-of-good-pairs",
      "solved": true,
      "solvedAt": "2025-09-08T23:20:00Z"
    },
    {
      "id": 2,
      "title": "Distribute Candies",
      "difficulty": "Easy",
      "tags": ["Array", "HashTable", "Math", "Greedy"],
      "url": "https://leetcode.com/problems/distribute-candies/",
      "docs": "/crackmode/docs/problems/distribute-candies",
      "solved": true,
      "solvedAt": "2025-09-09T20:59:00Z"
    }
  ],
  "2025-09-09": [
    {
      "id": 1,
      "title": "Longest Palindrome",
      "difficulty": "Easy",
      "tags": ["HashTable", "Greedy", "String"],
      "url": "https://leetcode.com/problems/longest-palindrome/",
      "docs": "/crackmode/docs/problems/longest-palindrome",
      "solved": true,
      "solvedAt": "2025-09-09T20:20:00Z"
    }
  ],
  "2025-09-10": [
    {
      "id": 1,
      "title": "Most Common Word",
      "difficulty": "Easy",
      "tags": ["HashTable", "String", "Counting"],
      "url": "https://leetcode.com/problems/most-common-word/",
      "docs": "/crackmode/docs/problems/most-common-word",
      "solved": true,
      "solvedAt": "2025-09-11T20:15:00Z"
    }
  ],
  "2025-09-15": [
    {
      "id": 1,
      "title": "Merge Sorted Array",
      "difficulty": "Easy",
      "tags": ["Array", "Two Pointers", "Sorting"],
      "url": "https://leetcode.com/problems/merge-sorted-array/",
      "docs": "/crackmode/docs/problems/merge-sorted-array",
      "solved": true,
      "solvedAt": "2025-09-15T20:24:00Z"
    }
  ],
  "2025-09-16": [
    {
      "id": 1,
      "title": "Best Time to Buy and Sell Stock",
      "difficulty": "Easy",
      "tags": ["Array", "Dynamic Programming"],
      "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      "docs": "/crackmode/docs/problems/best-time-to-buy-and-sell-stock",
      "solved": true,
      "solvedAt": "2025-09-16T19:56:00Z"
    },
    {
      "id": 2,
      "title": "Number of 1 Bits",
      "difficulty": "Easy",
      "tags": ["Bit Manipulation"],
      "url": "https://leetcode.com/problems/number-of-1-bits/",
      "docs": "/crackmode/docs/problems/number-of-1-bits",
      "solved": true,
      "solvedAt": "2025-09-16T20:04:00Z"
    }
  ],
  "2025-09-18": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table"],
      "url": "https://leetcode.com/problems/two-sum/",
      "docs": "/crackmode/docs/problems/two-sum",
      "solved": true,
      "solvedAt": "2025-09-18T17:12:00Z"
    },
    {
      "id": 2,
      "title": "Contains Duplicate",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table", "Sorting"],
      "url": "https://leetcode.com/problems/contains-duplicate/",
      "docs": "/crackmode/docs/problems/contains-duplicate",
      "solved": true,
      "solvedAt": "2025-09-18T17:28:00Z"
    }
  ],
  "2025-09-19": [
    {
      "id": 1,
      "title": "Determine if Two Strings are Close",
      "difficulty": "Easy",
      "tags": ["Array", "Two Pointers", "Sorting"],
      "url": "https://leetcode.com/problems/determine-if-two-strings-are-close/",
      "docs": "/crackmode/docs/problems/determine-if-two-strings-are-close",
      "solved": true,
      "solvedAt": "2025-09-19T20:24:00Z"
    }
  ],
}
