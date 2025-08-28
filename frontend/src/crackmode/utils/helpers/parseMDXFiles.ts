import fs from "fs"
import { type SearchableDoc } from "@/crackmode/types/search";
import matter from "gray-matter"
import type { MDXFile, EnhancedSearchableDoc } from "../../types/search";
import path from "path";


export const parseMDXFiles = async (
  docsDirectory: string,
  baseUrl: string = "https://frontend-production-a85f.up.railway.app/"
): Promise<EnhancedSearchableDoc[]> => {
  const searchableData: EnhancedSearchableDoc[] = []

  function getAllMDXFiles(dir: string, baseRoute = ""): MDXFile[] {
    const files: MDXFile[] = []
    const items: string[] = fs.readdirSync(dir)

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        // Recursively get files from subdirectories
        const subRoute = baseRoute ? `${baseRoute}/${item}` : item;
        files.push(...getAllMDXFiles(itemPath, subRoute))
      } else if (item.endsWith(".mdx") || item.endsWith(".md")) {
        try {
          const fileContent = fs.readFileSync(itemPath, "utf-8");
          const { data: frontmatter, content } = matter(fileContent)

          // Get file stats for dates
          const stats = fs.statSync(itemPath)
          // Create slug from file path
          const fileName = item.replace(/\.(mdx?|md)$/, '');
          const slug = baseRoute ? `${baseRoute}/${fileName}` : fileName;

          files.push({
            slug,
            frontmatter: {
              ...frontmatter,
              //TODO confirm that file system dates if not in frontmatter
              publishedAt: frontmatter.publishedAt || frontmatter.date || stats.birthtime,
              updatedAt: frontmatter.updatedAt || stats.mtime,
            },
            content,
            filepath: itemPath
          });
        } catch (error) {
          console.warn(`Failed to parse ${itemPath}:`, error)
        }
      }
    }
    return files
  }

  const mdxFiles = getAllMDXFiles(docsDirectory)

  for (const mdxFile of mdxFiles) {
    const { slug, frontmatter, content } = mdxFile;

    // Strip MSX/JSX and get the plain text
    const plainTextContent = stripMDXContent(content)

    // Extract heading from MDC content
    const headings = extractHeadingsFromMDX(content)

    // Create URL
    const url = `/crackmode/docs/${slug}`
    const canonicalUrl = `${baseUrl}${url}`

    // Create excerpt
    const excerpt = frontmatter.description || frontmatter.excerpt || createExcerpt(plainTextContent)

    // Extract or use frontmatter tags
    const tags = frontmatter.tags || extractTagsFromContent(plainTextContent, slug, frontmatter.title);

    // Calculate reading time
    const readingTime = calculateReadingTime(plainTextContent)

    // Generate SEO metadata
    const title = frontmatter.title || formatSlugToTitle(slug);

    // TODO confirm that the title does not affect the MENTspace
    const seoTitle = frontmatter.seoTitle || frontmatter.title || `${title} | Crackmode Documentation`
    const seoDescription = frontmatter.seoDescription || frontmatter.description || excerpt;

    // Keyword generation
    const keywords = frontmatter.keywords || generateKeywords(title, plainTextContent, tags)

    // Generate social media metadata
    const ogTitle = frontmatter.ogTitle || seoTitle;
    const ogDescription = frontmatter.ogDescription || seoDescription;
    const ogImage = frontmatter.ogImage || frontmatter.image || generateDefaultOGImage(title, frontmatter.section);

    const searchableDoc: EnhancedSearchableDoc = {
      id: slug,
      title,
      content: plainTextContent,
      excerpt,
      url,
      canonicalUrl,
      section: frontmatter.section || inferSectionFromPath(slug),
      tags,
      headings,
      publishedAt: frontmatter.publishedAt,
      updatedAt: frontmatter.updatedAt,
      author: frontmatter.author || "Morgan Ngetich",
      readingTime,
      seo: {
        title: seoTitle,
        description: seoDescription,
        keywords,
        robots: frontmatter.robots || 'index,follow',
        jsonLd: generateJSONLD(title, seoDescription, canonicalUrl, frontmatter, readingTime)
      },
      socialMedia: {
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle: frontmatter.twitterTitle || ogTitle,
        twitterDescription: frontmatter.twitterDescription || ogDescription,
        twitterImage: frontmatter.twitterImage || ogImage,
      }
    };
    searchableData.push(searchableDoc)
  }

  return searchableData
}

// Strip MDX/JSX content to get searchable plain text
function stripMDXContent(content: string): string {
  return content
    // Remove import/export statements completely
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+.*$/gm, '')
    
    // Handle React components more intelligently
    .replace(/<([A-Z][A-Za-z0-9]*)[^>]*>([\s\S]*?)<\/\1>/g, (tag, innerContent) => {
      // Preserve content from common components
      if (['Card', 'Alert', 'Note', 'Callout'].includes(tag)) {
        return innerContent;
      }
      return innerContent || '';
    })
    
    // Remove self-closing JSX components but preserve alt text
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*alt=['"]([^'"]*)['"][^>]*\/>/g, '$1')
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, '')
    
    // Better HTML tag handling - preserve important content
    .replace(/<(strong|b|em|i)[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    .replace(/<[a-z]+[^>]*>([\s\S]*?)<\/[a-z]+>/g, '$1')
    .replace(/<[^>]+>/g, '')
    
    // Improve markdown processing
    .replace(/^#{1,6}\s+/gm, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks - remove completely
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links - keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images - keep alt text
    
    // Clean up special characters and whitespace
    .replace(/[{}]/g, '') // Remove curly braces
    .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
    .replace(/\n/g, ' ') // Newlines to spaces
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/[^\w\s.,!?;:-]/g, ' ') // Remove special chars but keep punctuation
    .trim();
}


// Extract headings from MDX content (handles both markdown and JSX)
function extractHeadingsFromMDX(content: string): SearchableDoc['headings'] {
  const headings: SearchableDoc['headings'] = [];
  const seenIds = new Set<string>();

  // Match markdown headings
  const markdownHeadingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = markdownHeadingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = createHeadingId(text, seenIds);
    headings.push({ level, text, id });
  }

  // Match JSX heading components (e.g., <h1>, <h2>, etc.)
  const jsxHeadingRegex = /<h([1-6])(?:[^>]*)>([^<]+)<\/h[1-6]>/gi;

  while ((match = jsxHeadingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].trim();
    const id = createHeadingId(text, seenIds);
    headings.push({ level, text, id });
  }

  return headings
}

// Create heading ID from text with duplicate handling
function createHeadingId(text: string, seenIds: Set<string>): string {
  const baseId = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let finalId = baseId;
  let counter = 1;

  // Handle duplicates by appending numbers
  while (seenIds.has(finalId)) {
    finalId = `${baseId}-${counter}`;
    counter++;
  }

  seenIds.add(finalId);
  return finalId;
}

// Create excerpt from content
function createExcerpt(content: string, maxLength = 160): string {
  const cleaned = content.replace(/\s+/g, ' ').trim();
  
  // If content is short enough, return as-is
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Try to find a good breaking point
  const truncated = cleaned.substring(0, maxLength);
  
  // Look for sentence endings
  const sentenceEndings = ['. ', '! ', '? '];
  let bestBreak = -1;
  
  for (const ending of sentenceEndings) {
    const lastIndex = truncated.lastIndexOf(ending);
    if (lastIndex > maxLength * 0.6 && lastIndex > bestBreak) {
      bestBreak = lastIndex + ending.length - 1;
    }
  }
  
  if (bestBreak > 0) {
    return truncated.substring(0, bestBreak).trim();
  }
  
  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  
  return truncated.trim() + '...';
}


// Extract tags from content and metadata
function extractTagsFromContent(content: string, slug: string, title?: string): string[] {
  const textToAnalyze = `${title || ''} ${content} ${slug}`.toLowerCase();

  // Categorized tags for better matching
  const tagCategories = {
    difficulty: ['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced'],
    topics: [
      'array', 'arrays', 'string', 'strings', 'linked-list', 'tree', 'graph',
      'binary-tree', 'hash-map', 'two-pointers', 'sliding-window', 'recursion',
      'dynamic-programming', 'greedy', 'backtracking', 'sorting', 'searching'
    ],
    concepts: [
      'leetcode', 'algorithm', 'data-structure', 'optimization', 'complexity',
      'interview', 'coding', 'problem-solving', 'pattern', 'technique'
    ],
    technologies: [
      'javascript', 'python', 'java', 'cpp', 'react', 'typescript',
      'frontend', 'backend', 'api'
    ]
  };

  const extractedTags: string[] = [];

  // Extract from each category
  Object.values(tagCategories).forEach(category => {
    category.forEach(tag => {
      if (textToAnalyze.includes(tag) && !extractedTags.includes(tag)) {
        extractedTags.push(tag);
      }
    });
  });

  // Add section-based tags
  if (slug.includes('leetcode75')) extractedTags.push('leetcode75');
  if (slug.includes('arrays')) extractedTags.push('arrays');
  if (slug.includes('strings')) extractedTags.push('strings');

  return extractedTags.slice(0, 6); // Limit to 6 most relevant tags
}

// Infer section from file path
function inferSectionFromPath(slug: string): string {
  const parts = slug.split('/');
  
  if (parts.length > 1) {
    const section = parts[0];
    
    // Map common paths to friendly names
    const sectionMap: Record<string, string> = {
      'leetcode75': 'LeetCode 75',
      'arraysStrings': 'Arrays & Strings', 
      'twoPointers': 'Two Pointers',
      'slidingWindow': 'Sliding Window',
      'prefixSum': 'Prefix Sum',
      'hashMapSet': 'Hash Map & Set',
      'stack': 'Stack',
      'queue': 'Queue',
      'linkedList': 'Linked List',
      'binaryTree': 'Binary Tree',
      'binarySearch': 'Binary Search',
      'backtracking': 'Backtracking',
      'dp': 'Dynamic Programming',
      'graph': 'Graph Theory',
      'heap': 'Heap / Priority Queue',
      'intervals': 'Intervals',
      'monotonic': 'Monotonic Stack',
      'trie': 'Trie',
      'bit': 'Bit Manipulation'
    };
    
    return sectionMap[section] || formatSlugToTitle(section);
  }
  
  return 'Documentation';
}

// Format slug to readable title
function formatSlugToTitle(slug: string): string {
  return slug
    .split('/')
    .pop() // Get last segment
    ?.replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()) || slug;
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute)
}

// Generate JSON-LD structured data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateJSONLD(title: string, description: string, url: string, frontmatter: any, readingTime: number) {
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": frontmatter.publishedAt,
    "dateModified": frontmatter.updatedAt,
    "author": {
      "@type": "Person",
      "name": frontmatter.author || "Morgan Ngetich" // TODO update to CrackMode Team
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Organization",
      "logo": {
        "@type": "ImageObject",
        "url": "https://frontend-production-a85f.up.railway.app/group.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "wordCount": description.split(' ').length * 7, // Rough estimate
    "timeRequired": `PT${readingTime}M`,
    "inLanguage": "en-US",
    "isAccessibleForFree": true
  };

  return JSON.stringify(jsonLD);
}

// TODO use vercel OG to generate default OG images.
function generateDefaultOGImage(title: string, section?: string): string {
  const params = new URLSearchParams({
    title: title.substring(0, 60), // limit title length
    section: section || 'Documentation',
    theme: "crackmode"
  })

  return `https://frontend-production-a85f.up.railway.app/.com/api/og?${params.toString()}`;
}


function generateKeywords(title: string, content: string, tags: string[]): string {
  const importantWords = extractImportantWords(content)
  const titleWords = title.toLowerCase().split(/\s+/).filter(word => word.length > 3);

  const allKeywords = [
    ...titleWords,
    ...tags,
    ...importantWords.slice(0, 5), // Top 5 content words
    'crackmode', 'leetcode', 'algorithm'
  ];

  return [...new Set(allKeywords)].join(', ');
}


function extractImportantWords(content: string): string[] {
  const commonWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was',
    'that', 'be', 'have', 'has', 'had', 'do', 'said', 'get', 'make', 'go',
    'see', 'now', 'way', 'could', 'my', 'than', 'first', 'been', 'call',
    'who', 'its', 'did', 'just', 'over', 'think', 'also', 'your', 'work',
    'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now',
    'made', 'before', 'here', 'through', 'when', 'where', 'how', 'what',
    'does', 'there', 'each', 'she', 'he', 'it', 'they', 'them', 'this',
    'will', 'would', 'about', 'if', 'up', 'out', 'many', 'then', 'some'
  ]);

  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word =>
      word.length > 4 &&
      !commonWords.has(word) &&
      /^[a-zA-Z]+$/.test(word)
    );

  // Count word frequency
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Return most frequent words
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}