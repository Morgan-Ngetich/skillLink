import { Flex, Box, Text, Button } from "@chakra-ui/react";
import { useLocation } from "@tanstack/react-router";

const NotFound = () => {
  const location = useLocation();

  // Check if the current path starts with /crackmode/
  const isCrackMode = location.pathname.startsWith('/crackmode');

  return (
    <Flex
      justify="center"
      align="center"
      height="100vh"
      px={4}
      textAlign="center"
    >
      <Box>
        {isCrackMode ? (
          <>
            <Text fontSize="4xl" fontWeight="bold" mb={2} color={"orange"}>
              Coming Soon!
            </Text>
            <Text fontSize="md" mb={6}>
              This page is under development and will be available soon.
            </Text>
          </>
        ) : (
          <>
            <Text fontSize="4xl" fontWeight="bold" mb={2}>
              Oops! Page not found.
            </Text>
            <Text fontSize="md" mb={6}>
              The page you're looking for doesn't exist or has been moved.
            </Text>
          </>
        )}

        <Button
          onClick={() => history.back()}
        >
          Go Back
        </Button>

      </Box>
    </Flex>
  );
};

export default NotFound;