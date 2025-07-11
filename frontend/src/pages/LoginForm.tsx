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
import { Link } from '@tanstack/react-router';
import { PasswordInput } from '@/components/ui/password-input';
import { isValidEmail } from '@/utils/validator';
import { useCleanRedirect } from '@/hooks/auth/authState';
// import useAuthRedirect from '@/hooks/auth/authState';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { signIn, signInWithGoogle } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const toast = useToaster();
  // const navigate = useNavigate();
  const redirect = useCleanRedirect()

  const onSubmit = async ({ email, password }: LoginFormData) => {
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        id: 'login-failed',
        title: 'Login failed',
        description: error.message ?? 'An unknown error occurred.',
        status: 'error',
      });
    } else {
      toast({
        id: 'login-success',
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
      });

      redirect()
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={{ base: "gray.100", _dark: "gray.800" }}
      px={4}
    >
      <Box
        maxW="md"
        w="100%"
        p={8}
        bg={{ base: "white", _dark: "gray.900" }}
        boxShadow="lg"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={{ base: "gray.300", _dark: "gray.600" }}
      >
        <Heading
          size="lg"
          mb={6}
          textAlign="center"
          color="bodyColor"
        >
          Log In
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={5} align="stretch">
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
              {errors.email && (
                <Text fontSize="xs" color="red.400">
                  {errors.email.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel color="bodyColor">Password</FormLabel>
              <PasswordInput
                type="password"
                bg={{ base: "gray.50", _dark: "gray.700" }}
                _hover={{ bg: { base: "gray.100", _dark: "gray.600" } }}
                _focus={{ bg: { base: "white", _dark: "gray.800" }, borderColor: { base: "teal.500", _dark: "teal.300" } }}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <Text fontSize="xs" color="red.400">
                  {errors.password.message}
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              loading={isSubmitting}
              size="md"
              rounded="lg"
              _disabled={{ cursor: 'not-allowed' }}
            >
              Log In
            </Button>

            <Separator />

            <Flex justify={'center'} w="100%" mt={2}>
              <Button
                w="90%"
                textAlign={'center'}
                variant="ghost"
                onClick={signInWithGoogle}
                _disabled={{ cursor: 'not-allowed' }}
                border={'1px solid'}
              >
                <Box as={FcGoogle} mr={2} />
                Continue with Google
              </Button>
            </Flex>

            <Text color="bodyColor" mt={3} fontSize="sm" textAlign="center">
              Not registered yet?{' '}
              <Link to="/signup">
                <Text
                  as="span"
                  fontWeight="medium"
                  color="buttonOutlineColor"
                  _hover={{
                    textDecoration: 'underline',
                    color: 'buttonOutlineBorder',
                  }}
                >
                  Sign Up
                </Text>
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default LoginForm;
