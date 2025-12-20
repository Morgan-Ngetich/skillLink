import { Heading, Box, HStack, Button, useBreakpointValue, Flex } from "@chakra-ui/react";
import { FaAngleRight } from "react-icons/fa6";
import type { MentorExplorePublic } from "@/client";
import type React from "react";
import { MentorCard } from "../dashboard/mentor/MentorCard";
import { MentorCardSkeleton } from "../dashboard/mentor/MentorCardSkeleton";

interface FeaturedMentorsProps {
  featuredMentors: MentorExplorePublic[];
  isLoading: boolean;
}

const FeaturedMentors: React.FC<FeaturedMentorsProps> = ({ featuredMentors, isLoading }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box>
      <HStack
        justify="space-between"
        position={{ base: "static", md: "sticky" }}
        top={{ base: undefined, md: 0 }}
        zIndex={{ base: undefined, md: "5" }}
        py={2}
        bg={{ base: 'white', _dark: 'gray.900' }}
      >
        <Heading fontSize="lg">Featured Mentors</Heading>

        <Button
          size="xs"
          borderRadius="full"
          variant="surface"
          _hover={{ bg: { base: 'gray.200', _dark: 'gray.700' } }}
        >
          See more
          <FaAngleRight />
        </Button>
      </HStack>

      {isLoading ? (
        // Skeleton loading state
        isMobile ? (
          <HStack direction="row" w="100vw" overflowX="auto" pr={4} gap={2}>
            {[1, 2, 3].map((i) => (
              <MentorCardSkeleton key={i} />
            ))}
          </HStack>
        ) : (
          <Flex wrap={"wrap"} gap={2}>
            {[1, 2, 3].map((i) => (
              <MentorCardSkeleton key={i} />
            ))}
          </Flex>
        )
      ) : (
        // Actual content
        isMobile ? (
          <HStack direction="row" w="full" overflowX="auto" pr={4} gap={2}>
            {featuredMentors.map((mentor) => (
              <MentorCard key={mentor.user_id} mentor={mentor} maxW="250px"/>
            ))}
          </HStack>
        ) : (
          <Flex wrap={"wrap"} gap={2}>
            {featuredMentors.map((mentor) => (
              <MentorCard key={mentor.user_id} mentor={mentor} maxW="290px"/>
            ))}
          </Flex>
        )
      )}
    </Box>
  );
};

export default FeaturedMentors;