import { Box, SimpleGrid, Text, Image, Button } from "@chakra-ui/react";

const mentors =
  [
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
  ]


const MentCards = () => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="4">
      {mentors.map((item) => (
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
  );
}

export default MentCards;