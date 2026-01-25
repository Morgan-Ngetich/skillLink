import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { BiError, BiHome, BiUndo, BiRefresh } from 'react-icons/bi'
import { useColorModeValue } from '../ui'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error('DefaultCatchBoundary Error:', error)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="2xl">
        <VStack
          gap={6}
          bg={cardBg}
          p={8}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
        >
          {/* Error Icon */}
          <Box
            p={4}
            borderRadius="full"
            bg="red.100"
            _dark={{ bg: 'red.900' }}
          >
            <Icon
              as={BiError}
              boxSize={12}
              color="red.600"
              _dark={{ color: 'red.300' }}
            />
          </Box>

          {/* Error Heading */}
          <Heading
            size="xl"
            textAlign="center"
            color="red.600"
            _dark={{ color: 'red.300' }}
          >
            Oops! Something went wrong
          </Heading>

          {/* Error Message */}
          <Text
            textAlign="center"
            color="gray.600"
            _dark={{ color: 'gray.400' }}
            fontSize="lg"
          >
            We encountered an unexpected error. Don't worry, we're on it!
          </Text>

          {/* Error Component Details */}
          <Box w="full">
            <ErrorComponent error={error} />
          </Box>

          {/* Action Buttons */}
          <HStack gap={3} flexWrap="wrap" justify="center" w="full">
            <Button
              onClick={() => router.invalidate()}
              colorScheme="blue"
              size="lg"
              fontWeight="bold"
            >
              <Icon as={BiRefresh} />
              Try Again
            </Button>

            {isRoot ? (
              <Button
                as={Link}
                onClick={(e) => {
                  e.preventDefault()
                  router.navigate({ to: '/' })
                }}
                variant="outline"
                colorScheme="gray"
                size="lg"
                fontWeight="bold"
              >
                <Icon as={BiHome} />
                Go Home
              </Button>
            ) : (
              <Button
                as={Link}
                onClick={(e) => {
                  e.preventDefault()
                  window.history.back()
                }}
                variant="outline"
                colorScheme="gray"
                size="lg"
                fontWeight="bold"
              >
                <Icon as={BiUndo} />
                Go Back
              </Button>
            )}
          </HStack>

          {/* Help Text */}
          <Text
            fontSize="sm"
            color="gray.500"
            _dark={{ color: 'gray.500' }}
            textAlign="center"
          >
            If this problem persists, please contact support
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}