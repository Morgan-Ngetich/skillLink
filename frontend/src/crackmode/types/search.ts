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

export interface MDXFile {
  slug: string;
  frontmatter: {
    title?: string;
    description?: string;
    section?: string;
    subsection?: string;
    tags?: string[];
    order?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  content: string;
  filepath: string;
}