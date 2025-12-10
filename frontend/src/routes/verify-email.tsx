import { createFileRoute } from '@tanstack/react-router';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import useToaster from '@/hooks/public/useToaster';
import { Fade } from '../components/ui/fade';
import { IoMdClock } from "react-icons/io";

function VerifyEmailPage() {
  const search = Route.useSearch(); // { email: string }
  const { resendVerificationEmail } = useAuth();
  const toast = useToaster();

  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown === 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const getCooldownColor = (): string => {
    if (cooldown > 20) return 'green.400';
    if (cooldown > 10) return 'yellow.400';
    return 'red.400';
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resendCount >= 3) return;

    setLoading(true);
    const { error } = await resendVerificationEmail(search.email);
    setLoading(false);

    if (error) {
      toast({
        id: 'resend-failed',
        title: 'Resend failed',
        description: error.message ?? "Unable to resend email.",
        status: 'error',
      });

    } else {
      toast({
        id: 'resend-success',
        title: 'Email resent',
        description: "Check your inbox for a new confirmation link.",
        status: 'success',
      });

      setCooldown(30);
      setResendCount((prev) => prev + 1);
    }
  }, [cooldown, resendCount, resendVerificationEmail, search.email, toast]);

  useEffect(() => {
    if (search.expired === 'true') {
      toast({
        id: 'link-expired',
        title: 'Confirmation link expired',
        description: 'Sending new link to your email ...',
        status: 'warning',
      });

      const timer = setTimeout(() => {
        handleResend();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [search.expired, handleResend, toast]);

  return (
    <Flex
      minH="70vh"
      align="center"
      justify="center"
      bg={"bodyBg"}
      color="bodyColor"
    >

      <Box maxW="lg" mx="auto" textAlign="center" color="bodyColor" border={"1px solid"} borderColor={{ base: "black", _dark: "white" }} borderRadius="lg" bg={{ base: "white", _dark: "gray.900" }} boxShadow="md" p={8}>
        <VStack gap={6}>
          <Heading size="lg">Confirm Your Email</Heading>
          <Text fontSize="md">
            We’ve sent a confirmation link to <Text fontWeight={"bold"} color={'teal.500'}>{search.email}</Text>.
            Please check your inbox and click the link to activate your account.
          </Text>

          <HStack justify="center" gap={4}>
            <Button
              onClick={handleResend}
              variant="outline"
              disabled={loading || cooldown > 0}
              loading={loading}
              size="md"
              rounded="lg"
              bg={{ base: "teal.700", _dark: "teal.600" }}
              color={{ base: "white", _dark: "white" }}
              _hover={{ bg: { base: "teal.600", _dark: "teal.500" } }}
              _active={{ bg: { base: "teal.700", _dark: "teal.600" } }}
              _disabled={{ bg: { base: "teal.300", _dark: "teal.200" }, cursor: 'not-allowed' }}
              _focus={{
                bg: { base: "teal", _dark: "teal.800" },
                borderColor: { base: "teal.500", _dark: "teal.300" }
              }}
            >
              Resend Confirmation Email
            </Button>

            <Fade in={cooldown > 0}>
              <HStack gap={1} color={getCooldownColor()}>
                <IoMdClock size={20} />
                <Text fontWeight="medium" fontSize="sm">{cooldown}s</Text>
              </HStack>
            </Fade>
          </HStack>
        </VStack>
      </Box>
    </Flex>
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
