import { MentorCard } from "@/components/dashboard/mentorProfile/MentorCard";
import { Heading, SimpleGrid, Box, HStack, Button } from "@chakra-ui/react";
import { FaAngleRight } from "react-icons/fa6";
import { useColorModeValue } from "../ui";
import { mentors } from "@/client/services/ment";


const FeaturedMentors = () => {
  return (
    <Box>
      <HStack
        justify="space-between"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg={useColorModeValue("white", "gray.900")}
        py={2}
      >
        <Heading fontSize="lg">Featured Mentors</Heading>

        <Button
          size="xs"
          borderRadius="full"
          variant="outline"
          border="1px solid"
          _hover={{ bg: useColorModeValue("gray.200", "gray.700") }}
        >
          <FaAngleRight />
          See more
        </Button>
      </HStack>


      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={2}>
        {mentors.map((mentor, index) => (
          <MentorCard key={index} mentor={mentor} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default FeaturedMentors;
