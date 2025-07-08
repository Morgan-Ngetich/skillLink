import { Flex, Box, Text, Button } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

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

        <Link to="/">
          <Button>
            Go Home
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};

export default NotFound;
