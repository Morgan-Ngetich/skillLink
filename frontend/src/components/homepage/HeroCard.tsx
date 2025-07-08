import { Box, Flex, Text, Image, Button, Badge } from "@chakra-ui/react";
// import { Link } from "@tanstack/react-router";

const HeroCard = () => {
  return (
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
  );
}

export default HeroCard;