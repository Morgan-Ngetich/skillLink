'use client';

import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Heading,
  Flex,
  Separator,
  Icon,
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Avatar } from '@/components/ui/avatar';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/auth/useAuth';
import useToaster from '@/hooks/useToaster';
import { Link } from '@tanstack/react-router';
import { PasswordInput, PasswordStrengthMeter } from '@/components/ui/password-input';
import { calculatePasswordStrength } from '@/utils/password';
import { isValidEmail } from '@/utils/validator';
import { hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } from '@/utils/validator';
import { useCleanRedirect } from '@/hooks/auth/authState';
import { useGoogleUser } from '@/hooks/auth/authState';
type SignUpFormData = {
  fullName: string;
  email: string;
  password: string;
};

const SignupForm = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>();

  const passwordValue = watch('password');
  const toast = useToaster();
  const redirect = useCleanRedirect()
  const googleUser  = useGoogleUser()

  const onSubmit = async ({ fullName, email, password }: SignUpFormData) => {
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast({
        id: 'signup-failed',
        title: 'Signup failed',
        description: error.message ?? 'An unknown error occurred.',
        status: 'error',
      });
    } else {
      toast({
        id: 'signup-success',
        title: 'Signup successful',
        description: 'Welcome 🎉🎉🎉',
        status: 'success',
      });

      redirect()
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" px={4} bg={{ base: "gray.100", _dark: "gray.800" }}>
      <Box
        maxW="md"
        w="100%"
        p={6}
        bg={{ base: "white", _dark: "gray.900" }}
        borderWidth="1px"
        borderRadius="lg"
        borderColor="inputBorder"
        boxShadow="lg"
      >
        <Heading size="md" mb={6} textAlign="center" color="bodyColor">
          Create Account
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4} align="stretch">
            {/* Full Name */}
            <FormControl isInvalid={!!errors.fullName}>
              <FormLabel color="bodyColor">Full Name</FormLabel>
              <Input
                bg={{ base: "gray.50", _dark: "gray.700" }}
                _hover={{ bg: { base: "gray.100", _dark: "gray.600" } }}
                _focus={{ bg: { base: "white", _dark: "gray.800" }, borderColor: { base: "teal.500", _dark: "teal.300" } }}
                {...register('fullName', { required: 'Full name is required' })}
              />
              <Text color="red.400" fontSize="xs">
                {errors.fullName?.message}
              </Text>
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!errors.email}>
              <FormLabel color="bodyColor">Email</FormLabel>
              <Input
                type="email"
                bg={{ base: "gray.50", _dark: "gray.700" }}
                _hover={{ bg: { base: "gray.100", _dark: "gray.600" } }}
                _focus={{ bg: { base: "white", _dark: "gray.800" }, borderColor: { base: "teal.500", _dark: "teal.300" } }}
                {...register('email', {
                  required: 'Email is required',
                  validate: (val) => isValidEmail(val) || 'Invalid email format',
                })}
              />
              <Text color="red.400" fontSize="xs">
                {errors.email?.message}
              </Text>
            </FormControl>


            {/* Password */}
            <FormControl isInvalid={!!errors.password}>
              <FormLabel color="bodyColor">Password</FormLabel>
              <PasswordInput
                type="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                bg={{ base: "gray.50", _dark: "gray.700" }}
                _hover={{ bg: { base: "gray.100", _dark: "gray.600" } }}
                _focus={{
                  bg: { base: "white", _dark: "gray.800" },
                  borderColor: { base: "teal.500", _dark: "teal.300" },
                }}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                  validate: {
                    hasUpper: (val) => hasUpperCase(val) || 'Must contain an uppercase letter',
                    hasLower: (val) => hasLowerCase(val) || 'Must contain a lowercase letter',
                    hasNumber: (val) => hasNumber(val) || 'Must contain a number',
                    hasSpecial: (val) => hasSpecialChar(val) || 'Must contain a special character',
                  },
                })}
              />

              {passwordValue && (
                <PasswordStrengthMeter value={calculatePasswordStrength(passwordValue)} />
              )}

              <Text color="red.400" fontSize="xs">
                {errors.password?.message}
              </Text>
            </FormControl>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              size="md"
              rounded="lg"
              _disabled={{ cursor: 'not-allowed' }}
            >
              Sign Up
            </Button>

            <Separator my={2} />

            <Text textAlign="center" color="bodyColor" fontSize="xs">
              or
            </Text>

            {/* Google Sign In */}

            <Flex justify="center" w="100%">
              <Button
                onClick={signInWithGoogle}
                w="full"
                maxW="md"
                h="48px"
                border="2px solid"
                borderRadius="200px"
                borderImage="linear-gradient(95deg, #4285F4, #DB4437, #F4B400, #0F9D58) 0.5"
                boxShadow="none"
                fontWeight="500"
                fontSize="14px"
                lineHeight="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={4}
                gap={3}
                variant="ghost"
              >
                {googleUser?.avatar_url ? (
                  <Box position="relative" display="inline-block">
                    <Avatar size="sm" src={googleUser.avatar_url} name={googleUser.name} />
                    {/* Google Icon overlay */}
                    <Box
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      boxSize="16px"
                      borderRadius="full"
                      bg="white"                   // Background behind the icon
                      border="1px solid"
                      borderColor="gray.300"      // Soft border to match Google styling
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="0 0 2px rgba(0,0,0,0.1)" // Optional subtle shadow
                    >
                      <Icon as={FcGoogle} boxSize={4} />
                    </Box>
                  </Box>
                ) : (
                  <Box as={FcGoogle} boxSize={6} />
                )}
                <Text lineClamp={1} whiteSpace="nowrap">
                  {googleUser
                    ? `Continue as ${googleUser.email}`
                    : 'Sign in with Google'}
                </Text>
              </Button>
            </Flex>

            <Text color="bodyColor" mt={3} fontSize="sm" textAlign="center">
              Already signed up?{' '}
              <Link to="/login">
                <Text
                  as="span"
                  fontWeight="medium"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Log in
                </Text>
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default SignupForm;
