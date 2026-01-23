// import { generateMetaTags } from './generateMetaTags';
// import type { UserPublic } from '@/client';

// export function generateProfileMetaTags(user: UserPublic, baseUrl: string): string {
//   if (!user) {
//     return generateMetaTags({
//       title: 'Profile Not Found | MENTspace',
//       description: 'This profile could not be found.',
//       baseUrl,
//     });
//   }

//   const isMentor = user.is_mentor && user.profile?.mentor_profile;
  
//   // Build title
//   let title = user.full_name;
//   if (isMentor) {
//     const mentorTitle = user.profile?.mentor_profile?.title;
//     title = mentorTitle 
//       ? `${user.full_name} - ${mentorTitle}` 
//       : `${user.full_name} - Mentor`;
//   } else if (user.profile?.title) {
//     title = `${user.full_name} - ${user.profile.title}`;
//   }

//   // Build description
//   let description = user.profile?.about || `View ${user.full_name}'s profile`;
  
//   if (isMentor) {
//     const mentorProfile = user.profile!.mentor_profile!;
//     const expertise = mentorProfile.expertise?.slice(0, 3).join(', ') || '';
//     const stats = `${mentorProfile.total_sessions} sessions • ${mentorProfile.total_mentees} mentees`;
    
//     description = user.profile?.about 
//       ? `${user.profile.about.slice(0, 100)}... | ${stats}`
//       : `Mentor specializing in ${expertise} | ${stats}`;
//   }

//   // Build keywords
//   const keywords = [
//     user.full_name,
//     ...(user.profile?.skills || []),
//     ...(user.profile?.interests || []),
//     ...(user.profile?.area_of_focus || []),
//   ];

//   if (isMentor) {
//     keywords.push(
//       'mentor',
//       ...(user.profile?.mentor_profile?.expertise || []),
//       ...(user.profile?.mentor_profile?.industries || []),
//     );
//   }

//   return generateMetaTags({
//     title: `${title} | MENTspace`,
//     description,
//     canonical: `/profile/${user.uuid}`,
//     ogType: 'profile',
//     ogImage: `/api/og/profile/${user.uuid}?type=${isMentor ? 'mentor' : 'user'}`,
//     ogImageAlt: `${user.full_name}'s profile`,
//     author: user.full_name,
//     keywords: keywords.filter(Boolean),
//     baseUrl,
//   });
// }