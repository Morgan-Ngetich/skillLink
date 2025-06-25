import { createFileRoute } from '@tanstack/react-router';
import { Box, Heading, Text, Button, HStack, } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import useToaster from '../hooks/useToaster';
import { Fade } from '../components/ui/fade';
import { IoMdClock } from "react-icons/io";

function VerifyEmailPage() {
  const search = Route.useSearch(); // { email: string }
  const { resendVerificationEmail } = useAuth();
  const toast = useToaster();

  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown === 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  // Determine color by time left
  const getCooldownColor = () => {
    if (cooldown > 20) return 'green.500';
    if (cooldown > 10) return 'yellow.500';
    return 'red.500';
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resendCount >= 3) return;

    setLoading(true);
    const { error } = await resendVerificationEmail(search.email);
    setLoading(false);

    if (error) {
      toast("Resend failed", error.message ?? "Unable to resend email.", "error");
    } else {
      toast("Email resent", "Check your inbox for a new confirmation link.", "success");
      setCooldown(30);
      setResendCount((prev) => prev + 1);
    }
  }, [cooldown, resendCount, resendVerificationEmail, search.email, toast]);

  useEffect(() => {
    if (search.expired === 'true') {
      toast(
        'Confirmation link expired',
        'Sending new link to your email ...',
        'warning'
      );

      // Auto resend after 2s
      const timer = setTimeout(() => {
        handleResend();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [search.expired, handleResend, toast]);

  return (
    <Box maxW="lg" mx="auto" mt="16" textAlign="center">
      <Heading size="lg" mb="4">Confirm Your Email</Heading>
      <Text fontSize="md" mb="6">
        We’ve sent a confirmation link to <strong>{search.email}</strong>.<br />
        Please check your inbox and click the link to activate your account.
      </Text>

      <HStack justify="center" gap={4}>
        <Button
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          loading={loading}
          colorScheme="teal"
        >
          Resend Confirmation Email
        </Button>

        {/* Countdown timer with fade */}
        <Fade in={cooldown > 0}>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color={getCooldownColor()}
            transition="color 0.3s ease"
          >
            <HStack>
              <IoMdClock size={'25px'} />
              {cooldown}s
            </HStack>

          </Text>
        </Fade>
      </HStack>
    </Box>
  );
}

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>) => {
    if (!search.email || typeof search.email !== 'string') {
      throw new Error("Missing or invalid 'email' query parameter");
    }
    return { email: search.email, expired: search.expired as string | undefined };
  },
  component: VerifyEmailPage,
});