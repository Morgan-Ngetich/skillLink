import { Box, Text, HStack, IconButton } from '@chakra-ui/react';
import { Avatar } from '@/components/ui';
import { LuStar, LuThumbsUp, LuThumbsDown } from 'react-icons/lu';

// Mock review data
const MOCK_REVIEWS = [
  {
    name: "Grace Wanjiru",
    role: "UI/UX Designer",
    time: "2 weeks ago",
    stars: 5,
    text: "Incredible mentor! The guidance helped me land my first design role. Patient, knowledgeable, and genuinely cares about growth.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "James Mwangi",
    role: "Product Designer",
    time: "1 month ago",
    stars: 4,
    text: "Outstanding expertise in design systems and product strategy. Feedback was constructive and actionable.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg"
  },
  {
    name: "Sarah Njeri",
    role: "UX Researcher",
    time: "2 months ago",
    stars: 5,
    text: "Working together transformed my approach to UX research. Learned how to think like a product designer.",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg"
  }
];

interface ReviewsTabProps {
  isMentor?: boolean;
}

const ReviewsTab = ({ isMentor }: ReviewsTabProps) => {
  return (
    <Box px={{ base: 3, md: 0 }}>
      <Text fontWeight="bold" fontSize="lg" mb={6}>
        Reviews from {isMentor ? 'Mentees' : 'Mentors'}
      </Text>

      {MOCK_REVIEWS.map((review, i) => (
        <Box
          key={i}
          pb={6}
          mb={6}
          borderBottom="1px solid"
          borderColor="border.subtle"
          _last={{ borderBottom: "none", mb: 0, pb: 0 }}
        >
          <HStack align="flex-start" gap={3} mb={3}>
            <Avatar src={review.avatar} name={review.name} />

            <Box flex={1}>
              <Text fontWeight="semibold" fontSize="sm">{review.name}</Text>
              <Text fontSize="xs" color="fg.muted">
                {review.role} • {review.time}
              </Text>

              <HStack gap={1} mt={1}>
                {[...Array(5)].map((_, idx) => (
                  <LuStar
                    key={idx}
                    size={14}
                    fill={idx < review.stars ? "orange" : "transparent"}
                    color="orange"
                  />
                ))}
              </HStack>
            </Box>
          </HStack>

          <Text fontSize="sm" color="fg.muted" lineHeight="1.6" mb={2}>
            {review.text}
          </Text>

          <HStack gap={4} fontSize="sm" color="fg.muted">
            <HStack gap={1}>
              <IconButton aria-label="Like" variant="ghost" size="xs">
                <LuThumbsUp />
              </IconButton>
              <Text fontSize="xs">12</Text>
            </HStack>
            <IconButton aria-label="Dislike" variant="ghost" size="xs">
              <LuThumbsDown />
            </IconButton>
          </HStack>
        </Box>
      ))}
    </Box>
  );
};

export default ReviewsTab;