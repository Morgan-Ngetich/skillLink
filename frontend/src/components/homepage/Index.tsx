import {
  Box,
  Flex,
  Text,
  Image,
  SimpleGrid,
  Button,
  Badge,
} from "@chakra-ui/react";
import { Stat } from "../ui/stat";

const Home = () => {
  return (
    <Box py="6" px={{ base: "4", md: "8" }}>
      {/* Main layout grid */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} gap="6">
        {/* Left (Hero + Cards) */}
        <Box as="section" gridColumn={{ xl: "span 2" }}>
          {/* Hero card */}
          <Flex
            direction={{ base: "column", md: "row" }}
            bg="bg.surface"
            border="1px solid"
            borderColor="border.default"
            rounded="xl"
            overflow="hidden"
            shadow="md"
            mb="6"
          >
            <Box w={{ md: "40%" }} h="350px">
              <Image
                src="https://i.pinimg.com/736x/62/2c/40/622c4045130ab54fa0a90f5b012f2232.jpg"
                alt="MentSpace Hero"
                w="100%"
                h="100%"
                objectFit="cover"
                borderRadius="xl"
              />
            </Box>
            <Box
              p="6"
              flex="1"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Text fontSize="4xl" fontWeight="bold" color="fg.emphasized">
                Welcome to MentSpace
              </Text>
              <Text fontSize="sm" mt="2" color="fg.muted">
                Connect with mentors, attend meaningful events, build your
                network, and spark powerful talks to accelerate your career
                growth.
              </Text>
              <Flex mt="4" gap="3" align="center">
                <Badge colorPalette="blue">M.E.N.T. Ready</Badge>
                <Button size="sm" rounded="md">
                  Become a Mentor
                </Button>
              </Flex>
            </Box>
          </Flex>

          {/* M.E.N.T. Feature Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="4">
            {[
              {
                name: "Mentor",
                description: "Find and connect with top mentors in your industry.",
                image:
                  "https://i.pinimg.com/736x/90/bb/18/90bb185ecf87ebb3753be5357cc1b24c.jpg",
              },
              {
                name: "Events",
                description: "Join curated events that align with your career goals.",
                image:
                  "https://i.pinimg.com/736x/fb/f0/58/fbf0580f3f234b61c39461680cc9d2df.jpg",
              },
              {
                name: "Network",
                description: "Expand your network with driven, like-minded people.",
                image:
                  "https://i.pinimg.com/736x/c7/83/46/c783467209ed4e90d18e97695509e9eb.jpg",
              },
              {
                name: "Talk",
                description: "Host or attend impactful discussions and panels.",
                image:
                  "https://i.pinimg.com/736x/c2/de/10/c2de108998c625199c674ff7f88b71e2.jpg",
              },
            ].map((item) => (
              <Box
                key={item.name}
                bg="bg.surface"
                border="1px solid"
                borderColor="border.default"
                rounded="lg"
                shadow="sm"
                overflow="hidden"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  w="100%"
                  h="140px"
                  objectFit="cover"
                />
                <Box p="2">
                  <Text fontWeight="bold" fontSize="md" mb="1">
                    {item.name}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {item.description}
                  </Text>
                  <Button mt="3" size="xs">
                    Explore
                  </Button>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Right Panel */}
        <Flex direction="column" gap="6">
          {/* Growth Stats */}
          <Box
            bg="bg.surface"
            p="6"
            rounded="xl"
            border="1px solid"
            borderColor="border.default"
            shadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb="4">
              Your Activity
            </Text>

            <Stat
              label="Profile Views"
              value={214}
              change={0.18}
              formatOptions={{ maximumFractionDigits: 0 }}
            />

            <Box mt="6">
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Upcoming Session
              </Text>
              <Text fontSize="sm" color="fg.muted">
                🗓️ Thursday, 4:00 PM — “Breaking into Tech”
              </Text>
            </Box>

            <Button mt="5" colorScheme="blue" size="sm" width="full">
              View Full Activity
            </Button>
          </Box>


          {/* Top Mentors */}
          <Box
            bg="bg.surface"
            p="6"
            rounded="xl"
            border="1px solid"
            borderColor="border.default"
            shadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb="4">
              Featured Mentors
            </Text>
            <Flex direction="column" gap="4">
              {["Sarah Mento", "James Eventon", "Dr. Talkman"].map(
                (name, index) => (
                  <Flex key={index} align="center" gap="3">
                    <Image
                      src={`https://i.pravatar.cc/50?img=${index + 4}`}
                      alt={name}
                      rounded="full"
                      boxSize="40px"
                    />
                    <Box>
                      <Text fontWeight="medium">{name}</Text>
                      <Text fontSize="xs" color="fg.muted">
                        @{name.split(" ")[0].toLowerCase()}
                      </Text>
                    </Box>
                  </Flex>
                )
              )}
            </Flex>
          </Box>
        </Flex>
      </SimpleGrid>
    </Box>
  );
};

export default Home;
