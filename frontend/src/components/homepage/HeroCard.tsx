import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  Link,
  Icon,
} from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';
import { AvatarGroup, Avatar, useColorModeValue } from '../ui';
import { LuUser, LuUsers, LuBookOpen } from 'react-icons/lu';
import { FiYoutube, FiUserCheck, FiGlobe, FiBookOpen, } from 'react-icons/fi';

const HeroCard = () => {
  const avs = useColorModeValue('gray.100', 'gray.700');
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      w="full"
      maxW="960px"
      rounded="xl"
      shadow="md"
      overflow="hidden"
      border="1px solid"
      h="sm"
    >
      {/* Left: Mentor Info & Session */}
      {/* Left: NFT Image and Bid Info */}
      <Box
        w={{ base: '100%', md: '45%' }}
        p={4}
        position="relative"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        rounded="lg"
        bgImage="url('https://picsum.photos/seed/udemy/800')"
        bgSize="cover"
        bgRepeat="no-repeat"
        overflow="hidden"
        h='full'
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1}
        />

        <Box position="relative" zIndex={2} h="full" display="flex" flexDirection="column">
          <Flex justify="space-between" align="center" mb={4}>
            <AvatarGroup size="sm">
              <Avatar src="https://i.pravatar.cc/40?img=1" border="2px solid" />
              <Avatar src="https://i.pravatar.cc/40?img=2" border="2px solid" />
              <Avatar src="https://i.pravatar.cc/40?img=3" border="2px solid" />
            </AvatarGroup>
            <Badge
              position="relative"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="bold"
              colorPalette={'green'}
              variant={'subtle'}
            >
              Starts in: 25m
            </Badge>
          </Flex>

          <Box mt="auto" mb={4}>
            <HStack gap={2} align="start">
              <Avatar
                src="https://i.pravatar.cc/40?img=1"
                size="md"
                name="Jane Doe"
              />
              <VStack align="start" gap={0}>
                <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold" color="white">
                  Jane Doe
                </Text>
                <Text fontSize="sm" color="gray.300" lineClamp={2}>
                  Senior Engineer @ Meta — passionate about helping mentees ace tech interviews.
                </Text>
              </VStack>
            </HStack>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              mb={1}
              color="gray.50"
              lineClamp={1}
            >
              System Design
            </Text>
          </Box>

          <Box
            bg={useColorModeValue("whiteAlpha.700", "blackAlpha.600")}
            p={4}
            borderRadius="lg"
            backdropFilter="blur(4px)"
          >
            <Text fontSize="sm" color="fg.muted">
              Session Slots
            </Text>
            <HStack justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold" fontSize="xl">
                  3 / 5 Booked
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  Limited spots available
                </Text>
              </Box>
              <Button
                size="sm"
                rounded="full"
                fontWeight="bold"
                px={6}
                _hover={{ transform: 'scale(1.05)' }}
                _active={{ transform: 'scale(0.98)' }}
              >
                Book Now
              </Button>
            </HStack>
          </Box>
        </Box>
      </Box>

      {/* Right: Info Panel */}
      <Box w={{ base: '100%', md: '55%' }} px={6} pt={6} display="flex" flexDirection="column" h="full">
        <Tabs.Root defaultValue="details" display="flex" flexDirection="column" flex="1" minH="0">
          <Tabs.List mb={4}>
            <Tabs.Trigger value="details">
              <HStack>
                <LuUser />
                Details
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="members">
              <HStack>
                <LuUsers />
                Mentees
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="prep">
              <HStack>
                <LuBookOpen />
                Preparation
              </HStack>
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>

          <Tabs.Content value="details" flex="1" minH="0" overflowY="auto">
            <VStack align="start" gap={3}>
              <Text fontSize="sm">Wed, July 24 — 9:30 PM EAT</Text>
              <Text fontSize="3xl" fontWeight="bold" lineClamp={2}>
                Live Mock Interview: System Design
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Practice a real-world system design interview. Get structured feedback, tips, and real-time mentoring from Jane.
              </Text>
              <HStack justify="space-between" w="full" mt={2}>
                <HStack>
                  <Avatar size="sm" src="https://i.pravatar.cc/40?img=8" />
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold">Jane Doe</Text>
                    <Text fontSize="xs">Mentor</Text>
                  </Box>
                </HStack>
                <Button size="xs" rounded="md">
                  View Profile
                </Button>
              </HStack>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="members" flex="1" minH="0" overflowY="auto">
            <VStack align="stretch" gap={1}>
              {[
                { name: "Alex K.", location: "Nairobi", avatar: "https://i.pravatar.cc/40?img=11" },
                { name: "Priya R.", location: "Mumbai", avatar: "https://i.pravatar.cc/40?img=12" },
                { name: "John M.", location: "New York", avatar: "https://i.pravatar.cc/40?img=13" },
                { name: "Alex K.", location: "Nairobi", avatar: "https://i.pravatar.cc/40?img=11" },
                { name: "Priya R.", location: "Mumbai", avatar: "https://i.pravatar.cc/40?img=12" },
                { name: "John M.", location: "New York", avatar: "https://i.pravatar.cc/40?img=13" },
              ].map((mentee, index) => (
                <Flex key={index} align="center" p={1} borderRadius="md" _hover={{ bg: avs }} borderBottom={'1px solid'}>
                  <Avatar size="sm" src={mentee.avatar} name={mentee.name} mr={3} />
                  <Box flex={1}>
                    <Text fontWeight="medium">{mentee.name}</Text>
                    <Text fontSize="xs" color="fg.muted">{mentee.location}</Text>
                  </Box>
                  <Badge colorPalette="green" fontSize="xs">Booked</Badge>
                </Flex>
              ))}
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="prep" h='sm' overflowY={'auto'}>
            <VStack align="stretch" gap={4} pb={4}>

              <Box bg="cardbg" p={4} rounded="lg" shadow="sm">
                <HStack align="start">
                  <Icon boxSize={5} mt={1} color="blue.500">
                    <FiBookOpen />
                  </Icon>
                  <Box>
                    <Text fontWeight="medium">Designing Scalable Systems</Text>
                    <Text fontSize="sm" color="fg.muted">
                      Read this primer before the session. It's a great breakdown of scaling fundamentals.
                    </Text>
                    <Link href="https://assets/scalable-systems.pdf" color="blue.600" fontSize="sm">
                      View PDF ↗
                    </Link>
                  </Box>
                </HStack>
              </Box>

              <Box bg="cardbg" p={4} rounded="lg" shadow="sm">
                <HStack align="start">
                  <Icon boxSize={5} mt={1} color="red.500">
                    <FiYoutube />
                  </Icon>
                  <Box>
                    <Text fontWeight="medium">System Design Fundamentals (Video)</Text>
                    <Text fontSize="sm" color="fg.muted">
                      A walkthrough of load balancers, caching, and the CAP theorem.
                    </Text>
                    <Link
                      href="https://www.youtube.com/watch?v=vvhC7DoHiq0"
                      color="blue.600"
                      fontSize="sm"
                    >
                      Watch on YouTube ↗
                    </Link>
                  </Box>
                </HStack>
              </Box>

              <Box bg="cardbg" p={4} rounded="lg" shadow="sm">
                <HStack align="start">
                  <Icon boxSize={5} mt={1} color="green.500">
                    < FiGlobe />
                  </Icon>
                  <Box>
                    <Text fontWeight="medium">Explore: Real System Case Studies</Text>
                    <Text fontSize="sm" color="fg.muted">
                      Go through detailed system designs used by Netflix, Uber, and Stripe.
                    </Text>
                    <Link
                      href="https://github.com/donnemartin/system-design-primer"
                      color="blue.600"
                      fontSize="sm"
                    >
                      Visit GitHub ↗
                    </Link>
                  </Box>
                </HStack>
              </Box>

              <Box bg="cardbg" p={4} rounded="lg" shadow="sm">
                <HStack align="start">
                  <Icon boxSize={5} mt={1} color="purple.500">
                    <FiUserCheck />
                  </Icon>
                  <Box>
                    <Text fontWeight="medium">Bring Your Own System</Text>
                    <Text fontSize="sm" color="fg.muted">
                      Come ready to discuss a system you've designed or a challenging problem you faced.
                    </Text>
                  </Box>
                </HStack>
              </Box>
            </VStack>
          </Tabs.Content>

        </Tabs.Root>
      </Box>
    </Flex>
  );
};

export default HeroCard;
