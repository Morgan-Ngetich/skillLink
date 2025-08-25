import fs from "fs"
import { type SearchableDoc } from "@/crackmode/types/search";
import matter from "gray-matter"
import type { MDXFile } from "../../types/search";
import path from "path";


export const parseMDXFiles = async (docsDirectory: string): Promise<SearchableDoc[]> => {
  const searchableData: SearchableDoc[] = []

  function getAllMDXFiles(dir: string, baseRoute=""): MDXFile[] {
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

          // Create slug from file path
          const fileName = item.replace(/\.(mdx?|md)$/, '');
          const slug = baseRoute ? `${baseRoute}/${fileName}` : fileName;

          files.push({
            slug,
            frontmatter,
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

    // Extract heading from MDC content
    const headings = extractHeadingsFromMDX(content)

    // Create URL
    const url = `/crackmode/docs/${slug}`

    // Strip MSX/JSX and get the plain text
    const plainTextContent = stripMDXContent(content)

    // Create excerpt
    const excerpt = frontmatter.description || createExcerpt(plainTextContent)

    // Extract or use frontmatter tags
    const tags = frontmatter.tags || extractTagsFromContent(plainTextContent, frontmatter.title || slug);

    const searchableDoc: SearchableDoc = {
      id: slug,
      title: frontmatter.title || formatSlugToTitle(slug),
      content: plainTextContent,
      excerpt,
      url,
      section: frontmatter.section || inferSectionFromPath(slug),
      tags,
      headings
    };

    searchableData.push(searchableDoc)
  }

  return searchableData
}

// Strip MDX/JSX content to get searchable plain text
function stripMDXContent(content: string): string {
  return content
    // Remove import statements
    .replace(/^import\s+.*$/gm, '')
    // Remove export statements
    .replace(/^export\s+.*$/gm, '')
    // Remove JSX components but keep their text content
    .replace(/<([A-Z][A-Za-z0-9]*)[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    // Remove self-closing JSX components
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, '')
    // Remove HTML/JSX attributes but keep content
    .replace(/<([a-z]+)[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove markdown formatting
    .replace(/^#{1,6}\s+/gm, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
    // Clean up whitespace
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
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

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  // Try to break at work boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  return lastSpaceIndex > maxLength * 0.8 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

// Extract tags from content and metadata
function extractTagsFromContent(content: string, title: string): string[] {
  const contentLower = (content + ' ' + title).toLowerCase();
  
  const commonTags = [
    'getting-started', 'tutorial', 'guide', 'reference', 'api',
    'authentication', 'auth', 'setup', 'configuration', 'deployment',
    'security', 'database', 'frontend', 'backend', 'component',
    'hook', 'utility', 'example', 'advanced', 'beginner',
    'react', 'nextjs', 'typescript', 'javascript', 'css',
    'styling', 'routing', 'state', 'performance', 'testing'
  ];
  
  const extractedTags = commonTags.filter(tag => {
    const tagVariants = [tag, tag.replace('-', ' ')];
    return tagVariants.some(variant => contentLower.includes(variant));
  });
  
  // Limit to avoid too many tags
  return extractedTags.slice(0, 8);
}

// Infer section from file path
function inferSectionFromPath(slug: string): string {
  const parts = slug.split('/');
  
  if (parts.length > 1) {
    return formatSlugToTitle(parts[0]);
  }
  // TODO add more based on the common patterns.
  // Default sections based on common patterns
  const slugLower = slug.toLowerCase();
  
  if (slugLower.includes('getting-started') || slugLower.includes('intro')) {
    return 'Getting Started';
  } else if (slugLower.includes('auth')) {
    return 'Authentication';
  } else if (slugLower.includes('api')) {
    return 'API Reference';
  } else if (slugLower.includes('component')) {
    return 'Components';
  } else if (slugLower.includes('guide') || slugLower.includes('tutorial')) {
    return 'Guides';
  } else if (slugLower.includes('deploy')) {
    return 'Deployment';
  } else if (slugLower.includes('config')) {
    return 'Configuration';
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
