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


const ExplorePage = () => {
  // const { isOpen, onOpen, onClose } = useDisclosure();

  // const priceOptions: CollectionItem[] = [
  //   { id: "free", value: "Free only" },
  //   { id: "under_50", value: "Under $50/hr" },
  //   { id: "50_100", value: "$50-$100/hr" },
  //   { id: "over_100", value: "Over $100/hr" },
  // ];

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">

      {/* Mentor Grid */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
        gap={6}
      >
        {mentors.map((mentor) => (
          <MentorCard mentor={mentor} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ExplorePage;