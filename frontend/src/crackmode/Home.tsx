import { useState } from "react"
import {
  Box,
  Button,
  Container,
  VStack,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  HStack
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router"
import { useColorModeValue } from "@/components/ui/color-mode"
import { BsFillPatchCheckFill } from "react-icons/bs";
import { FaPlayCircle } from "react-icons/fa";
import { type LeetcodeProblem, mockProblems } from "./types/calendar";
import { Calendar } from "./components/calendar/Calendar";
import { ProblemDetails } from "./components/calendar/ProblemDetails";
import Header from "./components/Header";
import { IoLogoWhatsapp } from "react-icons/io";

// // Example dynamic rotating words (you can expand this array)
// const dynamicWords = [
//   { word: "Confidence", color: "#3498EB" },
//   { word: "Clarity", color: "#C39BBF" },
//   { word: "Consistency", color: "#02adad" },
// ];

const Home = () => {
  const checkerbgColor = useColorModeValue("gray.200", "gray.700");
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedProblems, setSelectedProblems] = useState<LeetcodeProblem[]>([])

  const handleDateClick = (dateString: string) => {
    const problems = mockProblems[dateString] || []
    setSelectedDate(dateString)
    setSelectedProblems(problems)
  }

  const handleCloseDetails = () => {
    setSelectedDate(null)
    setSelectedProblems([])
  }

  const gradientFrom = useColorModeValue("white", "bg")
  const gradientTo = useColorModeValue("gray.150", "gray.800")

  return (
    <>
      <Header />
      <Box
        // px={{ base: 0, md: 14 }}
        display="flex"
        minH={"91vh"}
        bgGradient="to-br"
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        alignItems={'center'}

      >
        <Container w="100%" my={{ base: 0, lg: 7 }} p={0}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="center"
            w="100%"
          >
            {/* Left Section (Text + CTA) */}
            <Box
              flex={1}
              p={{ base: 2, md: 6 }}
              mt={{ base: 3, md: 0 }}
              textAlign={{ base: "center", md: "left" }}
            >
              {/* Tagline */}
              <Flex
                bgColor={checkerbgColor}
                w="fit-content"
                gap={{ base: 1, md: 4 }}
                alignItems="center"
                px={3}
                py={1}
                borderRadius="full"
                mb={{ base: 2, md: 0 }}
                mx={{ base: "auto", md: 0 }}
              >
                <BsFillPatchCheckFill color="yellow" />
                <Text fontSize={{ base: "sm", md: "md" }}>
                  No Gatekeeping. No Flexing. Just Learning Together.
                </Text>
              </Flex>

              {/* Hero Heading */}
              <Heading
                as="h1"
                size={{ base: "3xl", md: "5xl" }}
                mb={4}
                textAlign={{ base: "center", lg: "start" }}
                fontWeight={"bold"}
              >
                Crack{" "}
                <Box
                  as="span"
                  position="relative"
                  display="inline-block"
                  lineHeight="1.4"
                >
                  <Text as="span" position="relative" zIndex="1">
                    Coding Interviews
                  </Text>
                </Box>{" "}
                Together Smarter.
              </Heading>

              {/* Subtext */}
              <Text fontSize={{ base: "lg", md: "xl" }} mb={10} mt={6}>
                A growing community of developers solving{" "}
                <Text as="span" color="orange">
                  LeetCode 75
                </Text>{" "}
                &{" "}
                <Text as="span" color="green.500">
                  System Design
                </Text>{" "} one problem at a time. No shortcuts. Just
                progress.
              </Text>

              {/* Buttons */}
              <Flex
                justify={{ base: "center", md: "flex-start" }}
                display={{ base: "none", md: "flex" }}
              >
                <a href="https://chat.whatsapp.com/Biz5sc2ow3v8Mg2aId6yOH" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    mr={6}

                  >
                    <HStack>
                      <IoLogoWhatsapp color="#008080" />
                      <Text>
                        Join CrackMode
                      </Text>
                    </HStack>
                  </Button>
                </a>
                <Link to="/crackmode/docs">
                  <Button
                    // bg="#C39BBF"
                    borderRadius="full"
                    size="lg"
                    variant="outline"
                    border={"1px solid"}
                    _hover={{
                      border: "1px solid gray"
                    }}
                  >
                    <FaPlayCircle style={{ fontSize: "24px", color: "#008080" }} /> Start Learning
                  </Button>
                </Link>
              </Flex>

              {/* Small tagline */}
              <Text mt={4} display={{ base: "none", md: "block" }}>
                From brute force to optimized — we grow together.
              </Text>

              {/* Stats Section */}
              <Box
                bg="gray.700"
                borderRadius="lg"
                boxShadow="lg"
                p={{ base: 2, md: 6 }}
                // py={{ base: 4, lg: 7 }}
                textAlign="center"
                mt={6}
              >
                <SimpleGrid columns={4} gap={4}>
                  {/* Active Members */}
                  <Box>
                    <Text
                      fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                      fontWeight="bold"
                      color="#3498EB"
                    >
                      100+
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="white">
                      Active CrackModes
                    </Text>
                  </Box>

                  {/* Daily Problems */}
                  <Box>
                    <Text
                      fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                      fontWeight="bold"
                      color="#C39BBF"
                    >
                      Daily
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="white">
                      Coding Challenges
                    </Text>
                  </Box>

                  {/* LeetCode Coverage */}
                  <Box>
                    <Text
                      fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                      fontWeight="bold"
                      color="#02adad"
                    >
                      75+
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="white">
                      LeetCode Problems
                    </Text>
                  </Box>

                  {/* Sessions */}
                  <Box my="auto">
                    <Text
                      fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                      fontWeight="bold"
                      color="orange"
                      lineHeight={"0.8"}
                    >
                      9:30 <span style={{ fontSize: "15px" }}>PM</span>
                    </Text>
                    {/* <Text fontSize={{ base: "sm", md: "md" }} color="white">
                    Daily Sessions
                  </Text> */}
                  </Box>
                </SimpleGrid>
              </Box>
            </Box>

            {/* Right Section (Image) */}
            <Box flex={1} p={0} display="flex" justifyContent="center">
              {/* <Image
                src={LandingPageimage} // Update with CrackMode branded illustration
                alt="CrackMode Community"
                borderRadius="lg"
              /> */}
              <Box>
                <Container>
                  <VStack gap={4}>
                    <VStack gap={2} textAlign="center">

                      <Text color="gray.600" _dark={{ color: "gray.400" }}>
                        Track our daily coding practice and problem-solving journey
                      </Text>
                    </VStack>

                    <Calendar problems={mockProblems} onDateClick={handleDateClick} />

                    {selectedDate && (
                      <ProblemDetails
                        isOpen={!!selectedDate}
                        date={selectedDate}
                        problems={selectedProblems}
                        onClose={handleCloseDetails}
                      />
                    )}
                  </VStack>
                </Container>
              </Box>
            </Box>

            {/* Mobile CTA */}
            <Flex
              justify={{ base: "center", md: "flex-start" }}
              display={{ base: "flex", md: "none" }}
              my={{ base: 4, md: 0 }}
            >
              <a
                href="https://chat.whatsapp.com/Biz5sc2ow3v8Mg2aId6yOH"
                target="_blank"
              >

                <Button
                  size="lg"
                  mr={3}
                >
                  <HStack>
                    <IoLogoWhatsapp color="#008080" />
                    <Text>
                      Join CrackMode
                    </Text>
                  </HStack>
                </Button>
              </a>

              <Link to="/crackmode/docs">
                <Button
                  colorScheme="gray"
                  bg="#C39BBF"
                  borderRadius="full"
                  size="lg"
                  p={3}
                  variant="solid"
                >
                  <FaPlayCircle style={{ fontSize: "24px", color: "#008080" }} /> Start Learning
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>

    </>
  );
};

export default Home;
