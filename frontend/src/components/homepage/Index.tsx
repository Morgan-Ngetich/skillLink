import {
  Box,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import HeroCard from "./HeroCard";
import MentCards from "./MentCards";
import GrowthStats from "./GrowthStats";
import TopMentors from "./TopMentors";

const Home = () => {
  return (
    <Box py="6" px={{ base: "4", md: "8" }}>
      <SimpleGrid columns={{ base: 1, xl: 3 }} gap="6">
        <Box as="section" gridColumn={{ xl: "span 2" }}>
          <HeroCard />
          <MentCards />
        </Box>

        {/* Right Panel */}
        <Flex direction="column" gap="6">
          <GrowthStats />
          <TopMentors />

        </Flex>
      </SimpleGrid>
    </Box>
  );
};

export default Home;
