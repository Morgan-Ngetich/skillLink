import { Flex, Box, Text, Button } from "@chakra-ui/react";

const NotFound = () => {
  return (
    <Flex
      justify="center"
      align="center"
      height="100vh"
      px={4}
      textAlign="center"
    >
      <Box>
        <Text fontSize="4xl" fontWeight="bold" mb={2}>
          Oops! Page not found.
        </Text>
        <Text fontSize="md" mb={6}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <Button
          onClick={() => history.back()}
          colorScheme="blue"
        >
          Go Back
        </Button>
      </Box>
    </Flex>
  );
};

export default NotFound;