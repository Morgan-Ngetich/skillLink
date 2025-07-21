import { Box, HStack, Text } from '@chakra-ui/react';
import { MentorCard } from "./MentorCard";

export const mentors = [
  {
    name: 'Jane Doe',
    title: 'Startup Advisor · Product Strategist',
    skills: ['Leadership', 'SaaS', 'Design Thinking'],
    bio: 'Mentoring first-time founders since 2015.',
    rating: 4.9,
    reviews: 32,
    location: 'New York, USA',
    rate: '$50/hr',
    photo: 'https://picsum.photos/id/1011/100',
    coverImage: 'https://picsum.photos/id/1018/400/200',
    available: true,
  },
  {
    name: 'Carlos Ruiz',
    title: 'Senior Data Scientist · AI Mentor',
    skills: ['Machine Learning', 'Python', 'NLP'],
    bio: 'Helping professionals transition into data science roles.',
    rating: 4.7,
    reviews: 18,
    location: 'Madrid, Spain',
    rate: '$40/hr',
    photo: 'https://picsum.photos/id/1005/100',
    coverImage: 'https://picsum.photos/id/1003/400/200',
    available: false,
  },
  {
    name: 'Fatima Ali',
    title: 'Product Manager · Startup Coach',
    skills: ['Product Strategy', 'Agile', 'Pitch Decks'],
    bio: 'Ex-Google PM mentoring early-stage founders.',
    rating: 5.0,
    reviews: 25,
    location: 'Toronto, Canada',
    rate: 'Free',
    photo: 'https://picsum.photos/id/1012/100',
    coverImage: 'https://picsum.photos/id/1016/400/200',
    available: true,
  },
  {
    name: 'David Kim',
    title: 'Software Architect · Tech Lead Mentor',
    skills: ['System Design', 'Backend', 'Scalability'],
    bio: 'Guiding senior engineers into tech leadership.',
    rating: 4.8,
    reviews: 40,
    location: 'Seoul, South Korea',
    rate: '$60/hr',
    photo: 'https://picsum.photos/id/1027/100',
    coverImage: 'https://picsum.photos/id/1022/400/200',
    available: true,
  },
  {
    name: 'Lara Singh',
    title: 'UX Designer · Career Coach',
    skills: ['UX/UI', 'Portfolio Reviews', 'Design Thinking'],
    bio: 'Helping designers land their first job in tech.',
    rating: 4.6,
    reviews: 14,
    location: 'Bangalore, India',
    rate: '$30/hr',
    photo: 'https://picsum.photos/id/1035/100',
    coverImage: 'https://picsum.photos/id/1032/400/200',
    available: false,
  },
];


const YourMentors = () => {
  return (
    <Box
      border="1px solid"
      borderRadius="xl"
      px={4}
      pt={4}
    >
      <Text fontWeight="semibold" >
        Your Mentors
      </Text>
      <Box
        overflowX="auto"
        whiteSpace="nowrap"
        pt={2}
      >
        <HStack gap={4}>
          {mentors.map((mentor) => (
            <Box key={mentor.name} display="inline-block" minW="300px">
              <MentorCard mentor={mentor} />
            </Box>
          ))}
        </HStack>
      </Box>
    </Box>

  );
};

export default YourMentors;
