// src/crackmode/components/seo/DocumentSEOHead.tsx - SSR Optimized
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
  
  // Only call hooks if we're in the browser (not SSR) and don't have props
  const shouldUseFallbackHooks = typeof window !== 'undefined' && !docProp && !breadcrumbsProp
  
  const usedoumentfrompath = useDocumentFromPath()
  const usebreadcrumbitems = useBreadcrumbItems()

  const calldocs = shouldUseFallbackHooks ? usedoumentfrompath : null
  const { structuredDataItems } = shouldUseFallbackHooks ? usebreadcrumbitems : { structuredDataItems: [] }
  
  // Memoize the doc and breadcrumbs to prevent unnecessary re-renders
  const doc = useMemo(() => docProp ?? calldocs, [docProp, calldocs])
  const breadcrumbs = useMemo(() => breadcrumbsProp ?? structuredDataItems, [breadcrumbsProp, structuredDataItems])

  // Memoize all derived data including structured data
  const seoData = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : "https://frontend-production-a85f.up.railway.app"

    // SEO values
    const title = doc?.seo?.title || titleProp || `${doc?.title || 'Documentation'} | CrackMode`
    const description = doc?.seo?.description || descriptionProp || doc?.excerpt || 'Master LeetCode & Algorithms with CrackMode community'
    const image = doc?.socialMedia?.ogImage || `${baseUrl}/api/v1/og?title=${encodeURIComponent(doc?.title || 'CrackMode')}&section=${encodeURIComponent(doc?.section || 'Documentation')}`
    const url = doc?.canonicalUrl || `${baseUrl}${doc?.url || (typeof window !== 'undefined' ? window.location.pathname : '/')}`
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
      "wordCount": doc.content?.split(' ').length || 0,
      "timeRequired": `PT${doc.readingTime || 5}M`,
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

    return {
      title,
      description,
      image,
      url,
      keywords,
      articleData,
      breadcrumbData,
      websiteData
    }
  }, [doc, titleProp, descriptionProp, breadcrumbs, siteName])

  return (
    <Helmet prioritizeSeoTags>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta name="robots" content={doc?.seo?.robots || 'index,follow'} />
      <meta name="theme-color" content="#1a202c" />
      <meta name="color-scheme" content="dark light" />
      {doc?.author && <meta name="author" content={doc.author} />}

      {/* Canonical URL */}
      <link rel="canonical" href={seoData.url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={doc ? 'article' : 'website'} />
      <meta property="og:title" content={doc?.socialMedia?.ogTitle || seoData.title} />
      <meta property="og:description" content={doc?.socialMedia?.ogDescription || seoData.description} />
      <meta property="og:url" content={seoData.url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={seoData.image} />
      <meta property="og:image:alt" content={seoData.title} />
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
          <meta property="article:reading_time" content={doc.readingTime?.toString() || '5'} />
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={doc?.socialMedia?.twitterTitle || seoData.title} />
      <meta name="twitter:description" content={doc?.socialMedia?.twitterDescription || seoData.description} />
      <meta name="twitter:image" content={doc?.socialMedia?.twitterImage || seoData.image} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />

      {doc?.readingTime && (
        <>
          <meta name="reading-time" content={`${doc.readingTime} min read`} />
          <meta name="estimated-reading-time" content={doc.readingTime.toString()} />
        </>
      )}

      {/* Structured Data (JSON-LD) */}
      {seoData.articleData && (
        <script type="application/ld+json">
          {JSON.stringify(seoData.articleData, null, 0)}
        </script>
      )}

      {/* Breadcrumb Structured Data */}
      {seoData.breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(seoData.breadcrumbData, null, 0)}
        </script>
      )}

      {/* Website Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.websiteData, null, 0)}
      </script>
    </Helmet>
  )
}

export default DocumentSEOHead