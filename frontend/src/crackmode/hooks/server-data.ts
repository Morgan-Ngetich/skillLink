import { type EnhancedSearchableDoc } from '../types/search';
import { type BreadcrumbItem } from '../types/docs';
import { sidebarConfig } from '../config/sidebarConfig';
import SearchData from '@/crackmode/data/searchData.json';

// Server-side version of useDocumentFromPath
export function getDocumentFromPath(pathname: string): EnhancedSearchableDoc | undefined {
  // Handle root path
  if (pathname === '/' || pathname === '/crackmode/docs') {
    return (SearchData as unknown as EnhancedSearchableDoc[]).find(item =>
      item.url === '/crackmode/docs'
    );
  }

  // Find the document that matches the current path
  const foundDoc = (SearchData as unknown as EnhancedSearchableDoc[]).find((item: EnhancedSearchableDoc) => {
    return item.url === pathname || pathname.endsWith(item.url);
  });

  return foundDoc;
}

// Server-side version of useBreadcrumbItems
export function getBreadcrumbItems(path: string): {
  displayItems: BreadcrumbItem[];
  structuredDataItems: BreadcrumbItem[];
} {
  const breadcrumbItems: BreadcrumbItem[] = [];

  // Build breadcrumbs by finding matching paths
  const findBreadcrumbPath = (currentPath: string) => {
    for (const section of sidebarConfig) {
      for (const link of section.links) {
        // Check direct match
        if (link.href === currentPath) {
          return { title: link.title, url: link.href };
        }

        // Check children
        if (link.children) {
          for (const child of link.children) {
            if (child.href === currentPath) {
              return { title: child.title, url: child.href, parent: link };
            }
          }
        }
      }
    }
    return null;
  };

  // Build breadcrumb trail
  const segments = path.split('/').filter(Boolean);
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;

    const match = findBreadcrumbPath(currentPath);
    if (match) {
      // If this is a child item and we haven't added its parent, add it first
      if (match.parent && !breadcrumbItems.some(item => item.url === match.parent?.href)) {
        breadcrumbItems.push({
          title: match.parent.title,
          url: match.parent.href,
          position: breadcrumbItems.length + 1
        });
      }
      breadcrumbItems.push({
        title: match.title,
        url: match.url,
        position: breadcrumbItems.length + 1
      });
    } else {
      // Fallback for unmatched segments
      const label = segments[i]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      breadcrumbItems.push({
        title: label,
        url: currentPath,
        position: breadcrumbItems.length + 1
      });
    }
  }

  // Filter out items you don't want to display
  const displayItems = breadcrumbItems.filter(item =>
    item.url && (
      !item.url.startsWith('/crackmode/docs') ||
      item.url !== '/crackmode'
    )
  );


  // For structured data, include the full path
  const structuredDataItems: BreadcrumbItem[] = [
    { title: 'CrackMode', url: '/crackmode', position: 1 },
    ...breadcrumbItems.map((item, index) => ({
      ...item,
      position: index + 2
    }))
  ];

  return {
    displayItems,
    structuredDataItems
  };
}