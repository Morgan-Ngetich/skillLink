import type { MentorSessionPublic } from '@/client'
import { seo } from './seo'
import { format, parseISO, isValid } from 'date-fns'

export function generateSessionSEO(
  session: MentorSessionPublic | null | undefined,
  mentorName?: string,
  baseUrl: string = import.meta.env.VITE_APP_URL || 'http://frontend-production-a85f.up.railway.app'
): ReturnType<typeof seo> {
  if (!session) {
    return seo({
      title: 'Session | MENTspace',
      description: 'This session could not be found.',
      noindex: true,
    })
  }

  const mentor = session.mentor
  const displayMentor = mentorName || mentor?.full_name || 'a mentor'

  // Title
  const title = `${session.title} with ${displayMentor}`

  // Date formatting
  let dateStr = ''
  try {
    const start = parseISO(session.start_time)
    if (isValid(start)) {
      dateStr = format(start, 'MMM d, yyyy · h:mm a')
    }
  } catch {
    dateStr = ''
  }

  // Description
  const parts: string[] = []
  if (session.description) {
    parts.push(session.description.slice(0, 100))
  }
  if (dateStr) parts.push(dateStr)
  const price = session.price_usd ? `$${session.price_usd}` : 'Free'
  parts.push(`${price} · ${session.duration_minutes} min`)
  if (session.available_spots && !session.is_full) {
    parts.push(`${session.available_spots} spots left`)
  } else if (session.is_full) {
    parts.push('Fully booked')
  }

  let description = parts.join(' | ')
  if (description.length > 160) {
    description = description.slice(0, 157) + '...'
  }

  // Keywords
  const keywords = [
    session.title,
    displayMentor,
    'mentorship session',
    'mentoring',
    ...(session.tags || []),
  ].filter(Boolean)

  // Canonical — points to the profile page with the session open
  const profileUuid = mentor?.uuid
  const canonical = profileUuid
    ? `${baseUrl}/profile/${profileUuid}?sessionDetailId=${session.uuid}`
    : undefined

  // OG image
  const ogImage = `${baseUrl}/api/v1/og/session/${session?.uuid}?type=mentor`


  return seo({
    title: `${title} | MENTspace`,
    description,
    canonical,
    ogType: 'article',
    ogImage,
    ogImageAlt: `${session.title} — session by ${displayMentor}`,
    author: displayMentor,
    keywords: keywords.slice(0, 10),
    twitterCard: 'summary_large_image',
    publishedTime: session.created_at,
    modifiedTime: session.updated_at,
  })
}