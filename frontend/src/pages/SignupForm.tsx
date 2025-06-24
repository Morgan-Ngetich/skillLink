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


type SignUpFormData = {
  fullName: string;
  email: string;
  password: string;
};

const SignupForm = () => {
  const { signUp } = useAuth();
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
      toast("Signup failed", error.message ?? "An unknown error occurred.", "error");
    } else {
      toast("Signup successful", "Check your email to confirm your account.", "success");
      // Redirect with email in search param
      navigate({ to: '/verify-email', search: { email } });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4} align="stretch">
          <FormControl isInvalid={!!errors.fullName}>
            <FormLabel>Full Name</FormLabel>
            <Input {...register('fullName', { required: 'Full name is required' })} />
            <Text color="red.500">{errors.fullName?.message}</Text>
          </FormControl>

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

          <Button type="submit" colorScheme="teal" loading={isSubmitting}>
            Sign Up
          </Button>
        </VStack>
      </form>
    </Box>
  );
}


export default SignupForm