import { Box, Flex, Text, Button, HStack } from '@chakra-ui/react';

const Header = () => {
  return (
    <Box
      w="100%"
      bg="gray.100"
      px={4}
      py={2}
      borderBottom="1px solid"
      borderColor="gray.300"
    >
      <Flex justify="space-between" align="center">
        <Text fontWeight="bold">Logo</Text>
        <HStack gap={4}>
          <Button>Login</Button>
          <Button colorScheme="blue">Sign up</Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
