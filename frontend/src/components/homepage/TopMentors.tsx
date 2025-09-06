import { Box, Flex, Text, Image, Badge, VStack, HStack } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa6";

const mentors = [
  { name: "Sarah Mento", role: "AI Researcher", img: 4 },
  { name: "James Eventon", role: "Systems Architect", img: 5 },
  { name: "Dr. Talkman", role: "NeuroTech Advisor", img: 6 },
  { name: "Sarah Mento", role: "AI Researcher", img: 1 },
  { name: "James Eventon", role: "Systems Architect", img: 2 },
  { name: "Dr. Talkman", role: "NeuroTech Advisor", img: 3 },
];

const TopMentors = () => {
  const border = { base: 'gray.200', _dark: 'gray.700' }
  return (
    <Box
      p="4"
      rounded="xl"
      border="1px solid"
      shadow="sm"
    >
      <Flex align="center" justify="space-between" mb="4">
        <Text fontSize="lg" fontWeight="bold">
          Top Mentors
        </Text>
        <Badge colorPalette="green" fontSize="xs" variant={'subtle'} border={'1px solid'}>
          Verified
        </Badge>
      </Flex>

      <VStack gap="2" align="stretch" maxH={'sm'} overflowY={'auto'}>
        {mentors.map((mentor, index) => (
          <Flex key={index} align="center" gap="4"
            // TODO Create a variant in the theme file, add this as the default styles for card.
            borderRadius="xl"
            boxShadow="xs"
            bg={"cardbg"}
            borderWidth="2px"
            borderColor={border}
            p={2}
          >
            <Image
              src={`https://i.pravatar.cc/50?img=${mentor.img}`}
              alt={mentor.name}
              rounded="full"
              boxSize="48px"
            />
            <Box>
              <Text fontWeight="semibold">{mentor.name}</Text>
              <Flex align="center" gap="2" mt="1">
                <HStack gap={1} align="center">
                  <FaStar color="orange" size={12} />
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                    @{mentor.name.split(" ")[0].toLowerCase()}
                  </Text>
                  <Text fontSize="xs">•</Text>
                  <Text fontSize="xs" color="fg.muted">{mentor.role}</Text>
                </HStack>
              </Flex>

            </Box>
          </Flex >
        ))}
      </VStack >
    </Box >
  );
};

export default TopMentors;
