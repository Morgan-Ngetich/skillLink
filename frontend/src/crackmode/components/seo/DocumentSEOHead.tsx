import { Helmet } from 'react-helmet-async'
import { type EnhancedSearchableDoc } from '@/crackmode/types/search'
import { type BreadcrumbItem } from '@/crackmode/types/docs';
import { useMemo } from 'react';
import { useDocumentFromPath } from '@/crackmode/hooks/useDocumentFromPath';
import { useBreadcrumbItems } from '@/crackmode/hooks/useBreadcrumbItems';

interface DocumentSEOHeadProps {
  doc?: EnhancedSearchableDoc;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[]
  siteName?: string;
  twitterHandle?: string
}

const DocumentSEOHead: React.FC<DocumentSEOHeadProps> = ({
  doc: docProp,
  title: titleProp,
  description: descriptionProp,
  breadcrumbs: breadcrumbsProp,
  siteName = "Crackmode",
  twitterHandle = "@crackmode"
}) => {
  const calldocs = useDocumentFromPath()
  const { structuredDataItems } = useBreadcrumbItems()
  
  // Memoize the doc and breadcrumbs to prevent unnecessary re-renders
  const doc = useMemo(() => docProp ?? calldocs, [docProp, calldocs])
  const breadcrumbs = useMemo(() => breadcrumbsProp ?? structuredDataItems, [breadcrumbsProp, structuredDataItems])

  // Memoize all derived data including structured data
  const { 
    seoTitle, 
    seoDescription, 
    seoImage, 
    seoUrl, 
    keywords, 
    articleStructuredData, 
    breadcrumbStructuredData,
    websiteStructuredData,
    helmetKey 
  } = useMemo(() => {
    const baseUrl = "https://frontend-production-a85f.up.railway.app"

    // SEO values
    const title = doc?.seo?.title || titleProp || `${doc?.title || 'Documentation'} | CrackMode`
    const description = doc?.seo?.description || descriptionProp || doc?.excerpt || 'Master LeetCode & Algorithms with CrackMode community'
    const image = doc?.socialMedia?.ogImage || `${baseUrl}/api/og?title=${encodeURIComponent(doc?.title || 'CrackMode')}&section=${encodeURIComponent(doc?.section || 'Documentation')}`
    const url = doc?.canonicalUrl || `${baseUrl}${doc?.url || '/'}`
    const keywords = doc?.seo?.keywords || `${doc?.tags?.join(', ') || ''}, crackmode, leetcode, algorithms`

    // Generate article structured data
    const articleData = doc ? {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": doc.title,
      "description": doc.excerpt,
      "url": url,
      "datePublished": doc.publishedAt,
      "dateModified": doc.updatedAt,
      "author": {
        "@type": "Person",
        "name": doc.author
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/group.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "image": {
        "@type": "ImageObject",
        "url": image,
        "width": 1200,
        "height": 630
      },
      "wordCount": doc.content.split(' ').length,
      "timeRequired": `PT${doc.readingTime}M`,
      "inLanguage": "en-US",
      "isAccessibleForFree": true,
      "articleSection": doc.section,
      "keywords": doc.tags,
      "proficiencyLevel": "Beginner to Advanced",
      "educationalLevel": "Professional Development"
    } : null

    // Generate breadcrumb structured data
    const breadcrumbData = breadcrumbs.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((breadcrumb) => ({
        "@type": "ListItem",
        "position": breadcrumb.position,
        "name": breadcrumb.title,
        "item": breadcrumb.url ? `${baseUrl}${breadcrumb.url}` : undefined
      }))
    } : null

    // Generate website structured data
    const websiteData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": baseUrl,
      "description": "Master LeetCode & Algorithms with CrackMode community",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    }

    // Content-based key for Helmet
    const key = `${doc?.url}-${doc?.updatedAt || doc?.publishedAt || Date.now()}`

    return {
      seoTitle: title,
      seoDescription: description,
      seoImage: image,
      seoUrl: url,
      keywords,
      articleStructuredData: articleData,
      breadcrumbStructuredData: breadcrumbData,
      websiteStructuredData: websiteData,
      helmetKey: key
    }
  }, [doc, titleProp, descriptionProp, breadcrumbs, siteName])

  // Memoize the entire helmet content to prevent unnecessary re-renders
  const helmetContent = useMemo(() => (
    <>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={doc?.seo?.robots || 'index,follow'} />
      <meta name="theme-color" content="#1a202c" />
      <meta name="color-scheme" content="dark light" />
      {doc?.author && <meta name="author" content={doc.author} />}

      {/* Canonical URL */}
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={doc ? 'article' : 'website'} />
      <meta property="og:title" content={doc?.socialMedia?.ogTitle || seoTitle} />
      <meta property="og:description" content={doc?.socialMedia?.ogDescription || seoDescription} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:alt" content={seoTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Article specific Open Graph tags */}
      {doc && (
        <>
          {doc.publishedAt && (
            <meta property="article:published_time" content={new Date(doc.publishedAt).toISOString()} />
          )}
          {doc.updatedAt && (
            <meta property="article:modified_time" content={new Date(doc.updatedAt).toISOString()} />
          )}
          {doc.author && <meta property="article:author" content={doc.author} />}
          {doc.section && <meta property="article:section" content={doc.section} />}
          {doc.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
          <meta property="article:reading_time" content={doc.readingTime.toString()} />
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={doc?.socialMedia?.twitterTitle || seoTitle} />
      <meta name="twitter:description" content={doc?.socialMedia?.twitterDescription || seoDescription} />
      <meta name="twitter:image" content={doc?.socialMedia?.twitterImage || seoImage} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />

      {doc?.readingTime && (
        <>
          <meta name="reading-time" content={`${doc.readingTime} min read`} />
          <meta name="estimated-reading-time" content={doc.readingTime.toString()} />
        </>
      )}

      {/* Favicons and Icons */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Structured Data (JSON-LD) */}
      {articleStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      )}

      {/* Breadcrumb Structured Data */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}

      {/* Website Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </script>

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </>
  ), [seoTitle, seoDescription, keywords, doc, seoUrl, seoImage, siteName, twitterHandle, articleStructuredData, breadcrumbStructuredData, websiteStructuredData])

  return (
    <Helmet key={helmetKey}>
      {helmetContent}
    </Helmet>
  )
}

export default DocumentSEOHead