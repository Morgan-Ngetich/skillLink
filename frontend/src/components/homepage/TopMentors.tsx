import { Box, Flex, Text, Image } from "@chakra-ui/react";

const TopMentors = () => {
  return (
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
  );
}

export default TopMentors;