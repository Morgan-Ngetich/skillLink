import {
  Box,
  Flex,
  SimpleGrid,
  VStack
} from "@chakra-ui/react";
import HeroCard from "./HeroCard";
import GrowthStats from "./GrowthStats";
import TopMentors from "./TopMentors";
import FeaturedMentors from "./FeaturedMentors";

const Home = () => {
  return (
    <Box py="6" px={{ base: "4", md: "8" }}>
      <SimpleGrid columns={{ base: 1, xl: 3 }} gap="6">
        <VStack as="section" gridColumn={{ xl: "span 2" }} gap={5}>
          <HeroCard />
          {/* <MentCards /> */}
          <FeaturedMentors />
        </VStack>

        {/* Right Panel */}
        <Flex direction="column" gap="6">
          <GrowthStats />

          {/* Make only TopMentors sticky */}
          <Box position="sticky" top="6" zIndex="1">
            <TopMentors />
          </Box>
        </Flex>

      </SimpleGrid>
    </Box>
  );
};

export default Home;
