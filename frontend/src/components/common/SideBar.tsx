import { Box, Button, VStack } from '@chakra-ui/react';

const Sidebar = () => {
  return (
    <Box
      w="220px"
      h="100vh"
      bg="gray.200"
      p={4}
      position="sticky"
      top={0}
    >
      <VStack gap={4} align="stretch">
        {["Home", "Settings", "Profile"].map((nav) => (
          <Button key={nav} variant="ghost" justifyContent="flex-start">
            {nav}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;
