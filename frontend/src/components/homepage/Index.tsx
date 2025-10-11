import {
  Box,
  Flex,
  SimpleGrid,
  VStack,
  useBreakpointValue,
  HStack,
} from "@chakra-ui/react";
import { useKeenSlider } from "keen-slider/react";
import { useState } from "react";

import HeroCard from "./herocard/HeroCard";
import GrowthStats from "./GrowthStats";
import TopMentors from "./TopMentors";
import FeaturedMentors from "./FeaturedMentors";

import "keen-slider/keen-slider.min.css";

const Home = () => {
  const isMobile = useBreakpointValue({ base: true, xl: false });

  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, sliderInstanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: false,
      slides: {
        perView: 1,
        spacing: 16,
      },
      drag: true,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    }
  );

  const bg = ({ base: "black", _dark: "white" })

  return (
    <Box py="6" px={{ base: "2", md: "8" }} maxW="100vw">
      {isMobile ? (
        <Flex direction="column" gap={4}>
          <Box>
            <Box ref={sliderRef} className="keen-slider" w="100%">
              <Box className="keen-slider__slide">
                <HeroCard />
              </Box>
              <Box className="keen-slider__slide">
                <GrowthStats />
              </Box>
            </Box>

            <HStack justify="center" mt={2}>
              {[0, 1].map((i) => (
                <Box
                  key={i}
                  h="6px"
                  w={currentSlide === i ? "15px" : "6px"}
                  bg={currentSlide === i ? bg : "fg.muted"}
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => sliderInstanceRef.current?.moveToIdx(i)}
                />
              ))}
            </HStack>
          </Box>


          <Box>
            <FeaturedMentors />
          </Box>

          <Box>
            <TopMentors />
          </Box>
        </Flex>
      ) : (
        <SimpleGrid columns={3} gap="6" alignItems="start">
          {/* Left Panel */}
          <VStack as="section" gridColumn={{ xl: "span 2" }} gap={5}>
            <HeroCard />
            <FeaturedMentors />
          </VStack>

          {/* Right Panel */}
          <Box>
            <Box mb="6">
              <GrowthStats />
            </Box>
            <Box position="sticky" top="6" zIndex="1">
              <TopMentors />
            </Box>
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default Home;
