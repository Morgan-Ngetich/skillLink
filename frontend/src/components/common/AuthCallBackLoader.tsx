import { Flex, Spinner, Text } from '@chakra-ui/react';

// const scroll = keyframes`
//   0% { transform: translateX(100%); }
//   100% { transform: translateX(-100%); }
// `;

export function AuthCallbackLoader() {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      height="100vh"
    >
      <Spinner color="teal.500" size="xl" mb={6} />
      <Flex
        overflow="hidden"
        width="300px"
        whiteSpace="nowrap"
      >
        <Text
          fontSize="md"
        >
          Setting up your account. Please wait...
        </Text>
      </Flex>
    </Flex>
  );
}





