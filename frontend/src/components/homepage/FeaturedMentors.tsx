import { MentorCard } from "@/components/dashboard/mentorProfile/MentorCard";
import { Heading, SimpleGrid, Box, HStack, Button, useBreakpointValue } from "@chakra-ui/react";
import { FaAngleRight } from "react-icons/fa6";
import { mentors } from "@/client/services/ment";


const FeaturedMentors = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  return (
    <Box >
      <HStack
        justify="space-between"
        position={{ base: "static", md: "sticky" }}
        top={{ base: undefined, md: 0 }}
        zIndex={{ base: undefined, md: "sticky" }}
        py={2}
        bg={{ base: 'white', _dark: 'gray.900' }}
      >
        <Heading fontSize="lg" >Featured Mentors</Heading>

        <Button
          size="xs"
          borderRadius="full"
          variant="plain"
          // border="1px solid"
          _hover={{ bg: { base: 'gray.200', _dark: 'gray.700' } }}
        >
          See more
          <FaAngleRight />
        </Button>
      </HStack>

      {isMobile ? (
        <HStack direction="row" w="100vw" overflowX={"auto"} pr={4}>
          {mentors.map((mentor, index) => (
            <MentorCard key={index} mentor={mentor} />
          ))}
        </HStack>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={2}>
          {mentors.map((mentor, index) => (
            <MentorCard key={index} mentor={mentor} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default FeaturedMentors;
