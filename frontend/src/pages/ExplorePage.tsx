import { Box, SimpleGrid } from "@chakra-ui/react";
import { MentorCard } from "@/components/dashboard/mentorProfile/MentorCard";
import { mentors, type Mentor } from "@/client/services/ment";
import { useSearch } from "@tanstack/react-router";
import { useFuseSearch } from "@/hooks/useFuseSearch ";

const ExplorePage = () => {
  const search = useSearch({ from: "/_layout/explore" });
  const query = search.q || "";

  const filteredMentorResults = useFuseSearch<Mentor>(mentors, query);

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
        {filteredMentorResults.map(({ item }, index) => (
          <MentorCard key={index} mentor={item} maxW="full"/>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ExplorePage;