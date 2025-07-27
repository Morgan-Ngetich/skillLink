import {
  Box,
  SimpleGrid,
  // Flex,
  // Input,
  // InputGroup,
  // HStack,
  // Button,
  // useDisclosure,
  // Select,
  // createListCollection,
  // type CollectionItem,
} from "@chakra-ui/react";
// import { FaSearch } from "react-icons/fa";
// import { FiChevronDown } from "react-icons/fi";
// import FilterModal from "@/components/explore/FilterModal";
import { MentorCard } from "@/components/dashboard/mentorProfile/MentorCard";
import { mentors } from "@/client/services/ment";
import { useSearch } from "@tanstack/react-router";
import { useMemo } from "react";


const ExplorePage = () => {
  const search = useSearch({ from: "/_layout/explore" });
  const query = search.q || ''

  const filteredMentors = useMemo(() => {
    if (!query) return mentors;

    const lowerQuery = query.toLowerCase();

    return mentors.filter((mentor) => {
      return (
        mentor.name.toLowerCase().includes(lowerQuery) ||
        mentor.title.toLowerCase().includes(lowerQuery) ||
        mentor.bio.toLowerCase().includes(lowerQuery) ||
        mentor.location.toLowerCase().includes(lowerQuery) ||
        mentor.skills.some((skill) => skill.toLowerCase().includes(lowerQuery)) ||
        mentor.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        mentor.badges.some((badge) => badge.toLowerCase().includes(lowerQuery))
      );
    });
  }, [query]);


  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}      >
        {filteredMentors.map((mentor) => (
          <MentorCard mentor={mentor} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ExplorePage;