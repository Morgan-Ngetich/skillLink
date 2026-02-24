import type { UserPublic } from '@/client'
import { seo } from './seo'

export function generateProfileSEO(
  user: UserPublic | null | undefined,
  baseUrl: string = import.meta.env.VITE_APP_URL || 'http://frontend-production-a85f.up.railway.app'
): ReturnType<typeof seo> {
  // Handle not found
  if (!user) {
    return seo({
      title: 'Profile | MENTspace',
      description: 'This profile could not be found.',
      noindex: true,
    })
  }

  const isMentor = user.is_mentor && user.profile?.mentor_profile

  // Build title
  let title = user.full_name
  if (isMentor) {
    const mentorTitle = user.profile?.mentor_profile?.title
    title = mentorTitle 
      ? `${user.full_name} - ${mentorTitle}` 
      : `${user.full_name} - Mentor`
  } else if (user.profile?.title) {
    title = `${user.full_name} - ${user.profile.title}`
  }

  // Build description
  let description = user.profile?.about || `View ${user.full_name}'s profile on MENTspace`
  
  if (isMentor && user.profile?.mentor_profile) {
    const mentorProfile = user.profile.mentor_profile
    const expertise = mentorProfile.expertise?.slice(0, 3).join(', ') || ''
    const stats = `${mentorProfile.total_sessions || 0} sessions • ${mentorProfile.total_mentees || 0} mentees`
    
    description = user.profile?.about 
      ? `${user.profile.about.slice(0, 120)}... | ${stats}`
      : `Expert mentor specializing in ${expertise} | ${stats}`
  }

  // Truncate description if too long
  if (description.length > 160) {
    description = description.slice(0, 157) + '...'
  }

  // Build keywords
  const keywords = [
    user.full_name,
    ...(user.profile?.skills || []),
    ...(user.profile?.interests || []),
    ...(user.profile?.area_of_focus || []),
  ]

  if (isMentor && user.profile?.mentor_profile) {
    keywords.push(
      'mentor',
      'mentorship',
      ...(user.profile.mentor_profile.expertise || []),
      ...(user.profile.mentor_profile.industries || []),
    )
  }

  // Build canonical URL
  const canonical = `${baseUrl}/profile/${user.uuid}`

  // Build OG image
  const ogImage = `${baseUrl}/api/v1/og/profile/${user.uuid}?type=${isMentor ? 'mentor' : 'user'}`

  return seo({
    title: `${title} | MENTspace`,
    description,
    canonical,
    ogType: 'profile',
    ogImage,
    ogImageAlt: `${user.full_name}'s ${isMentor ? 'mentor' : 'user'} profile`,
    author: user.full_name,
    keywords: keywords.filter(Boolean).slice(0, 10), // Limit to 10 keywords
    twitterCard: 'summary_large_image',
  })
}