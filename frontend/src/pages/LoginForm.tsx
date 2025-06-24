import {
  Box,
  Button,
  Input,
  VStack,
  Text,
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/auth/useAuth';
import useToaster from '../hooks/useToaster';
import { useNavigate } from '@tanstack/react-router';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { signIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const toast = useToaster();
  const navigate = useNavigate()

  const onSubmit = async ({ email, password }: LoginFormData) => {
    const { error } = await signIn(email, password);
    if (error) {
      toast('Login failed', error.message, 'error');
    } else {
      toast('Login successful', 'Welcome back!', 'success',);
      navigate({ to: '/' })
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4} align="stretch">
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register('email', { required: 'Email is required' })} />
            <Text color="red.500">{errors.email?.message}</Text>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              {...register('password', { required: 'Password is required' })}
            />
            <Text color="red.500">{errors.password?.message}</Text>
          </FormControl>

          <Button type="submit" colorScheme="blue" loading={isSubmitting}>
            Log In
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default LoginForm