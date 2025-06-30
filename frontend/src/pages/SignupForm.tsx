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
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/auth/useAuth';
import useToaster from '@/hooks/useToaster';
import { Link, useNavigate } from '@tanstack/react-router';

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
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>();

  const toast = useToaster();
  const navigate = useNavigate();

  const onSubmit = async ({ fullName, email, password }: SignUpFormData) => {
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast('Signup failed', error.message ?? 'An unknown error occurred.', 'error');
    } else {
      toast('Signup successful', 'Check your email to confirm your account.', 'success');
      navigate({ to: '/verify-email', search: { email } });
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

            <FormControl isInvalid={!!errors.email}>
              <FormLabel color="bodyColor">Email</FormLabel>
              <Input
                type="email"
                bg={{ base: "gray.50", _dark: "gray.700" }}
                _hover={{ bg: { base: "gray.100", _dark: "gray.600" } }}
                _focus={{ bg: { base: "white", _dark: "gray.800" }, borderColor: { base: "teal.500", _dark: "teal.300" } }}
                {...register('email', { required: 'Email is required' })}
              />
              <Text color="red.400" fontSize="xs">
                {errors.email?.message}
              </Text>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel color="bodyColor">Password</FormLabel>
              <Input
                type="password"
                bg={{ base: "gray.50", _dark: "gray.700" }}
                _hover={{ bg: { base: "gray.100", _dark: "gray.600" } }}
                _focus={{ bg: { base: "white", _dark: "gray.800" }, borderColor: { base: "teal.500", _dark: "teal.300" } }}
                {...register('password', { required: 'Password is required' })}
              />
              <Text color="red.400" fontSize="xs">
                {errors.password?.message}
              </Text>
            </FormControl>

            <Button
              type="submit"
              loading={isSubmitting}
              size="md"
              rounded={'lg'}
              bg={{ base: "teal.600", _dark: "teal.500" }}
              color={{ base: "white", _dark: "white" }}
              _hover={{ bg: { base: "teal.600", _dark: "teal.500" } }}
              _active={{ bg: { base: "teal.700", _dark: "teal.600" } }}
              _disabled={{ bg: { base: "teal.300", _dark: "teal.200" }, cursor: 'not-allowed' }}
            >
              Sign Up
            </Button>

            <Separator my={2} />

            <Text textAlign="center" color="bodyColor" fontSize="xs">
              or
            </Text>

            <Flex justify={'center'} w="100%" mt={2}>
              <Button
                w="90%"
                variant="outline"
                onClick={signInWithGoogle}
                color="buttonOutlineColor"
                borderColor="buttonOutlineBorder"
                _hover={{ bg: 'buttonOutlineHoverBg' }}
                _active={{ bg: 'buttonOutlineActiveBg' }}
                _disabled={{ cursor: 'not-allowed' }}
              >
                <Box as={FcGoogle} mr={2} />
                Sign up with Google
              </Button>
            </Flex>

            <Text color="bodyColor" mt={3} fontSize="sm" textAlign="center">
              Already signed up?{' '}
              <Link to="/login">
                <Text
                  as="span"
                  fontWeight="medium"
                  color="buttonOutlineColor"
                  _hover={{ textDecoration: 'underline', color: 'buttonOutlineBorder' }}
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
