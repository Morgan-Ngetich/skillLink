import {
  Box,
  Button,
  VStack,
  Text,
  Heading,
  Flex,
  Separator,
  Icon,
} from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/auth/useAuth';
import useToaster from '@/hooks/public/useToaster';
import { Link } from '@tanstack/react-router';
import { PasswordInput } from '@/components/ui/password-input';
import { isValidEmail } from '@/utils/validator';
import { useCleanRedirect } from '@/hooks/auth/authState';
// import useAuthRedirect from '@/hooks/auth/authState';
import { useGoogleUser } from '@/hooks/auth/authState';
import { StyledInput } from '@/components/ui';

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
  const googleUser = useGoogleUser()
  console.log("googleUser", googleUser)

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
        >
          Log In
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={5} align="stretch">
            <FormControl isInvalid={!!errors.email}>
              <FormLabel >Email</FormLabel>
              <StyledInput
                type="email"
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
              <FormLabel >Password</FormLabel>
              <PasswordInput
                type="password"
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

            <Separator my={2} />

            <Text textAlign="center"  fontSize="xs">
              or
            </Text>

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


            <Text  mt={3} fontSize="sm" textAlign="center">
              Not registered yet?{' '}
              <Link to="/signup">
                <Text
                  as="span"
                  fontWeight="medium"
                  _hover={{
                    textDecoration: 'underline'
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
