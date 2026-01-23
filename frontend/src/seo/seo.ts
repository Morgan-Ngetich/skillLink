export interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogType?: 'website' | 'article' | 'profile' | 'video.other'
  ogImage?: string
  ogImageWidth?: number
  ogImageHeight?: number
  ogImageAlt?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'player'
  twitterSite?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  keywords?: string[]
  noindex?: boolean
  siteName?: string
}

export const seo = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogImageAlt,
  twitterCard = 'summary_large_image',
  twitterSite = '@mentspace', // Your Twitter handle
  author,
  publishedTime,
  modifiedTime,
  keywords = [],
  noindex = false,
  siteName = 'MENTspace',
}: SEOProps) => {
  const tags = [
    // Basic meta
    { title },
    { name: 'description', content: description },
    ...(keywords.length > 0 ? [{ name: 'keywords', content: keywords.join(', ') }] : []),
    
    // Canonical
    ...(canonical ? [{ tagname: 'link', rel: 'canonical', href: canonical }] : []),
    
    // Open Graph
    { property: 'og:type', content: ogType },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: siteName },
    ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
    
    // Open Graph Image
    ...(ogImage ? [
      { property: 'og:image', content: ogImage },
      { property: 'og:image:width', content: String(ogImageWidth) },
      { property: 'og:image:height', content: String(ogImageHeight) },
      ...(ogImageAlt ? [{ property: 'og:image:alt', content: ogImageAlt }] : []),
    ] : []),
    
    // Twitter Card
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:site', content: twitterSite },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    ...(ogImage ? [
      { name: 'twitter:image', content: ogImage },
      ...(ogImageAlt ? [{ name: 'twitter:image:alt', content: ogImageAlt }] : []),
    ] : []),
    
    // Article/Profile specific
    ...(author ? [{ property: ogType === 'article' ? 'article:author' : 'profile:username', content: author }] : []),
    ...(publishedTime ? [{ property: 'article:published_time', content: publishedTime }] : []),
    ...(modifiedTime ? [{ property: 'article:modified_time', content: modifiedTime }] : []),
    
    // Robots
    ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
  ]

  return tags
}