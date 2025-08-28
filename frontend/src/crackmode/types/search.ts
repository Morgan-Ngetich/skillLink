export interface SearchableDoc {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  url: string;
  section: string;
  subsection?: string;
  tags: string[];
  headings: {
    level: number;
    text: string;
    id: string;
  }[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  robots: string;
  jsonLd: string;
}

export interface SocialMediaMetadata {
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage?: string;
}


export interface EnhancedSearchableDoc extends SearchableDoc {
  seo: SEOMetadata;
  socialMedia: SocialMediaMetadata;
  canonicalUrl: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  author?: string;
  readingTime: number;
}

export interface MDXFile {
  slug: string;
  frontmatter: {
    title?: string;
    description?: string;
    excerpt?: string;
    section?: string;
    subsection?: string;
    tags?: string[];
    keywords?: string;
    author?: string;
    publishedAt?: string | Date;
    updatedAt?: string | Date;
    robots?: string;

    // SEO specific
    seoTitle?: string;
    seoDescription?: string;

    // Open Graph
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    image?: string;

    // Twitter Cards
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;

    order?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };

  content: string;
  filepath: string;
}


// Frontmatter validation
export interface ValidatedFrontmatter {
  // Required
  title: string;
  description: string;
  
  // Optional but recommended for SEO
  section?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  
  // SEO optimization
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string;
  robots?: 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';
  
  // Social media
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Additional
  featured?: boolean;
  draft?: boolean;
  weight?: number; // For ordering
}