import type { MentorServicePublic } from '@/client'
import { seo } from './seo'

export function generateServiceSEO(
  service: MentorServicePublic | null | undefined,
  mentorName?: string,
  mentorUuid?: string,
  baseUrl: string = import.meta.env.VITE_APP_URL || 'http://frontend-production-a85f.up.railway.app'
): ReturnType<typeof seo> {
  if (!service) {
    return seo({
      title: 'Service | MENTspace',
      description: 'This service could not be found.',
      noindex: true,
    })
  }

  const displayMentor = mentorName || 'a mentor'

  // Title
  const title = `${service.title} by ${displayMentor}`

  // Description
  const parts: string[] = []
  if (service.description) {
    parts.push(service.description.slice(0, 120))
  }
  if (service.category) parts.push(service.category)
  const price = service.price_usd ? `$${service.price_usd}` : 'Free'
  const duration = service.estimated_duration_minutes
    ? `${service.estimated_duration_minutes} min`
    : null
  parts.push(duration ? `${price} · ${duration}` : price)

  let description = parts.join(' | ')
  if (description.length > 160) {
    description = description.slice(0, 157) + '...'
  }

  // Keywords
  const keywords = [
    service.title,
    displayMentor,
    service.category,
    'mentorship',
    'mentoring service',
    ...(service.highlights || []),
  ].filter(Boolean) as string[]

  // Canonical
  const canonical = mentorUuid
    ? `${baseUrl}/profile/${mentorUuid}?pt=about&st=services&serviceDetailId=${service.uuid}`
    : undefined

  // OG image — use banner if available, fall back to mentor profile card
  const ogImage = service.banner_url
    ? service.banner_url
    : mentorUuid
      ? `${baseUrl}/api/v1/og/profile/${mentorUuid}?type=mentor`
      : undefined

  return seo({
    title: `${title} | MENTspace`,
    description,
    canonical,
    ogType: 'article',
    ogImage,
    ogImageAlt: `${service.title} — service by ${displayMentor}`,
    author: displayMentor,
    keywords: keywords.slice(0, 10),
    twitterCard: 'summary_large_image',
    publishedTime: service.created_at,
    modifiedTime: service.updated_at,
  })
}