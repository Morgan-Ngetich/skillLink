// import { generateMetaTags } from './generateMetaTags';
// import type { MentorSessionPublic, UserPublic } from '@/client';

// export function generateSessionMetaTags(
//   session: MentorSessionPublic, 
//   mentor: UserPublic, 
//   baseUrl: string
// ): string {
//   const sessionDate = new Date(session.start_time).toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });
//   const sessionTime = new Date(session.start_time).toLocaleTimeString('en-US', {
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true
//   });

//   return generateMetaTags({
//     title: `${session.title} - ${mentor.full_name} | YourApp`,
//     description: `Join ${mentor.full_name} for "${session.title}" on ${sessionDate} at ${sessionTime}. ${session.description || ''}`,
//     canonical: `/profile/${mentor.uuid}/session/${session.uuid}`,
//     ogType: 'article',
//     ogImage: `/api/og/session/${session.uuid}`,
//     ogImageAlt: `${session.title} by ${mentor.full_name}`,
//     author: mentor.full_name,
//     publishedTime: session.created_at,
//     keywords: [
//       mentor.full_name,
//       'mentorship session',
//       session.title,
//       ...(session.tags || [])
//     ],
//     baseUrl,
//   });
// }