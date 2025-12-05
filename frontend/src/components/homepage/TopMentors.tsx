import { Box, Flex, Text, Image, Badge, VStack, HStack, Button } from "@chakra-ui/react";
import { FaStar, FaEye } from "react-icons/fa6";
import { useRef, useEffect, useState } from "react";

const mentors = [
  {
    name: "Sarah Mento",
    role: "AI Researcher",
    img: 4,
    rating: 4.9,
    reviews: 127,
    sessions: 85,
    location: "San Francisco",
    rate: "$120/hr",
    isOnline: true,
    viewedBy: 24,
    skills: ["Machine Learning", "Python"]
  },
  {
    name: "James Eventon",
    role: "Systems Architect",
    img: 5,
    rating: 4.8,
    reviews: 89,
    sessions: 62,
    location: "New York",
    rate: "$150/hr",
    isOnline: false,
    viewedBy: 18,
    skills: ["AWS", "Microservices"]
  },
  {
    name: "Dr. Talkman",
    role: "NeuroTech Advisor",
    img: 6,
    rating: 5.0,
    reviews: 156,
    sessions: 98,
    location: "Boston",
    rate: "$200/hr",
    isOnline: true,
    viewedBy: 31,
    skills: ["Neuroscience", "Research"]
  },
  {
    name: "Maria Santos",
    role: "Product Designer",
    img: 1,
    rating: 4.7,
    reviews: 73,
    sessions: 45,
    location: "Austin",
    rate: "$90/hr",
    isOnline: true,
    viewedBy: 15,
    skills: ["UI/UX", "Figma"]
  },
  {
    name: "Alex Chen",
    role: "Full Stack Developer",
    img: 2,
    rating: 4.9,
    reviews: 112,
    sessions: 78,
    location: "Seattle",
    rate: "$110/hr",
    isOnline: false,
    viewedBy: 22,
    skills: ["React", "Node.js"]
  },
  {
    name: "Dr. Kim Park",
    role: "Data Scientist",
    img: 3,
    rating: 4.8,
    reviews: 134,
    sessions: 91,
    location: "Chicago",
    rate: "$140/hr",
    isOnline: true,
    viewedBy: 28,
    skills: ["Analytics", "Python"]
  },
];

const PeopleAlsoViewed = () => {
  const border = { base: 'gray.200', _dark: 'gray.700' }
 const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop } = scrollContainer;

      // Show button when user has scrolled down (not at top)
      // You can adjust this threshold as needed
      const scrollThreshold = 50; // pixels

      // Option 1: Show button when scrolled past threshold
      setShowButton(scrollTop > scrollThreshold);

      // Option 2: Show button when near bottom (uncomment to use instead)
      // const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
      // setShowButton(isNearBottom);

      // Option 3: Show button when can scroll more (has more content below)
      // const canScrollMore = scrollTop + clientHeight < scrollHeight - 10;
      // setShowButton(canScrollMore);
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    // Check initial scroll position
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Flex
      pt={{ base: 1, md: 4 }}
      pb={1}
      px={{ base: 1, md: 4 }}
      rounded="xl"
      border={{ base: "", md: "1px solid" }}
      borderColor={border}
      shadow={{ base: "", md: "sm" }}
      maxH={"md"}
      direction={"column"}
      w='100%'
    >
      <Flex align="center" justify="space-between" mb="1">
        <VStack align="start" gap={0}>
          <Text fontSize="lg" fontWeight="bold">
            People also viewed
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Based on your recent activity
          </Text>
        </VStack>
        <Badge colorPalette="blue" fontSize="xs" variant={'subtle'} border={'1px solid'}>
          <HStack gap={1}>
            <FaEye size={10} />
            <Text>Trending</Text>
          </HStack>
        </Badge>
      </Flex>

      <VStack gap={1} align="stretch" maxH={'md'} overflowY={'auto'} mb={1}   ref={scrollContainerRef}>
        {mentors.map((mentor, index) => (
          <Box
            key={index}
            borderRadius="xl"
            bg={"cardbg"}
            borderWidth="1px"
            borderColor={border}
            p={2}
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: 'translateY(-1px)',
              shadow: 'md',
            }}
          >
            <Flex align="start" gap="3">
              <Box position="relative">
                <Image
                  src={`https://i.pravatar.cc/50?img=${mentor.img}`}
                  alt={mentor.name}
                  rounded="full"
                  boxSize="50px"
                  border="2px solid"
                  borderColor={mentor.isOnline ? "green.300" : "gray.200"}
                />
                {mentor.isOnline && (
                  <Box
                    position="absolute"
                    bottom="2px"
                    right="2px"
                    w="12px"
                    h="12px"
                    bg="green.400"
                    borderRadius="full"
                    border="2px solid white"
                  />
                )}
              </Box>

              <VStack align="start" gap={1} flex={1} minW={0}>
                <Flex w="100%" justify="space-between" align="start">
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold" fontSize="sm" lineClamp={1}>
                      {mentor.name}
                    </Text>

                    <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                      {mentor.role}
                    </Text>
                  </VStack>
                  <Text fontSize="sm" fontWeight="bold">
                    {mentor.rate}
                  </Text>
                </Flex>

                <HStack gap={1} fontSize="xs" color="gray.500">
                  <HStack gap={1}>
                    <FaStar color="orange" size={10} />
                    <Text>{mentor.rating}</Text>
                    <Text>({mentor.reviews})</Text>
                  </HStack>
                  <Text>•</Text>
                  <Text>{mentor.sessions} sessions</Text>
                </HStack>


              </VStack>

            </Flex>
          </Box>
        ))}
      </VStack>


      {showButton && (
        <Box
          w="100%"
          display="flex"
          justifyContent="center"
          p={0}
          opacity={showButton ? 1 : 0}
          transform={showButton ? 'translateY(0)' : 'translateY(10px)'}
          transition="all 0.3s ease-in-out"
        >
          <Button
            width="70%"
            size="sm"
            fontSize="xs"
            mt="auto"
          >
            View All Similar Mentors →
          </Button>
        </Box>
      )}

    </Flex>
  );
};

export default PeopleAlsoViewed;