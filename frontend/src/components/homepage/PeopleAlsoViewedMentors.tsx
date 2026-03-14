import { Box, Flex, Text, Image, Badge, VStack, HStack, Button } from "@chakra-ui/react";
import { FaStar, FaEye } from "react-icons/fa6";
import { useRef, useEffect, useState } from "react";
import { usePublicPeopleAlsoViewed } from "@/hooks/public/usePublicMentors";
import { useNavigate } from "@tanstack/react-router";
import { PeopleAlsoViewedSkeleton } from "@/skeletons/PeopleAlsoViewedSkeleton";


const PeopleAlsoViewedMentors = () => {

  const border = { base: 'gray.200', _dark: 'gray.700' };
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showButton, setShowButton] = useState(false);
  
  const navigate = useNavigate()

  const { data: mentors = [], isLoading } = usePublicPeopleAlsoViewed(6, true);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop } = scrollContainer;
      setShowButton(scrollTop > 50);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) return (
    <Box
      w='100%'
    >
      <PeopleAlsoViewedSkeleton />
    </Box>
  );

  if (!mentors.length) return null;

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
      <Flex align="center" justify="space-between" mb={{base: 2, md: 3}}>
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

      <VStack gap={1} align="stretch" maxH={'md'} overflowY={'auto'} mb={1} ref={scrollContainerRef}>
        {mentors.map((mentor) => (
          <Box
            key={mentor.uuid}
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
            onClick={() => {
              navigate({
                to: `/profile/${mentor.uuid}`
              })
            }}
          >
            <Flex align="start" gap="3">
              <Box position="relative">
                <Image
                  src={mentor.avatar_url ?? `https://i.pravatar.cc/50?u=${mentor.uuid}`}
                  alt={mentor.full_name ?? "Mentor"}
                  rounded="full"
                  boxSize="50px"
                  border="2px solid"
                  borderColor={mentor.is_available ? "green.300" : "gray.200"}
                />
                {mentor.is_available && (
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
                      {mentor.full_name ?? "Unknown"}
                    </Text>
                    <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                      {mentor.title}
                    </Text>
                  </VStack>
                  <Text fontSize="sm" fontWeight="bold">
                    {mentor.min_session_price
                      ? `$${mentor.min_session_price}/hr`
                      : "Free"}
                  </Text>
                </Flex>

                <HStack gap={1} fontSize="xs" color="gray.500">
                  <HStack gap={1}>
                    <FaStar color="orange" size={10} />
                    <Text>{mentor.average_rating?.toFixed(1) ?? "0"}</Text>
                  </HStack>
                  <Text>•</Text>
                  <Text>{mentor.total_sessions} sessions</Text>
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
          onClick={() => (
            navigate({
              to: "/explore",
              search: {
                view: 'mentors',
              }
            })
          )}
        >
          <Button width="70%" size="sm" fontSize="xs" mt="auto">
            View All Similar Mentors →
          </Button>
        </Box>
      )}
    </Flex>
  );
};

export default PeopleAlsoViewedMentors;