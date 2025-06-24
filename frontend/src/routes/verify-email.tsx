// routes/verify-email.tsx
import { createFileRoute } from '@tanstack/react-router';
import { Box, Heading, Text } from '@chakra-ui/react';

// Component first
function VerifyEmailPage() {
  const search = Route.useSearch(); // Access validated query params here

  return (
    <Box maxW="lg" mx="auto" mt="16" textAlign="center">
      <Heading size="lg" mb="4">Confirm Your Email</Heading>
      <Text fontSize="md">
        We’ve sent a confirmation link to <strong>{search.email}</strong>.<br />
        Please check your inbox and click the link to activate your account.
      </Text>
    </Box>
  );
}

// Then create route with validation and assign the component
export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>) => {
    if (!search.email || typeof search.email !== 'string') {
      throw new Error("Missing or invalid 'email' query parameter");
    }
    return { email: search.email };
  },
  component: VerifyEmailPage,
});
