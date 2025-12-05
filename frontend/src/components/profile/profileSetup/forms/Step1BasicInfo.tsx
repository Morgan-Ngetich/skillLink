import { VStack, Box, Flex, SimpleGrid } from '@chakra-ui/react';
import { StyledInput, StyledTextarea } from '@/components/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, Field } from '@/components/ui';
import UserProfileCard from '@/components/common/UserProfileCard';

export default function Step1BasicInfo() {
  const { register, control, formState: { errors } } = useFormContext();

  // Watch for validation feedback
  const title = useWatch({ control, name: "title" })
  const location = useWatch({ control, name: 'location' });
  const about = useWatch({ control, name: 'about' });

  const isStepComplete = !!title?.trim() && !!location?.trim() && !!about?.trim();

  return (
    <VStack gap={8} align="stretch" mx="auto" w="full" maxW="6xl">
      {!isStepComplete && (
        <Alert status="info" borderRadius="md" fontSize="sm" p={2}>
          Please fill in your basic information to continue.
        </Alert>
      )}

      <Flex
        direction={{ base: 'column', lg: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', lg: 'flex-start' }}
        gap={8}
        w="full"
      >
        {/* Profile Card Preview - Dynamic width */}
        <Box 
          w={{ base: 'full', lg: '340px' }} 
          flexShrink={0}
        >
          <UserProfileCard />
        </Box>

        {/* Editable Info - Takes remaining space */}
        <Box 
          flex={1}
          minW={0} // Prevents flex item from overflowing
        >
          <VStack gap={6} align="stretch">
            {/* Personal Information */}
            <SimpleGrid columns={1} gap={4}>
              {/* Title */}
              <Field
                label="Title"
                required
                errorText={errors.title?.message as string}
              >
                <StyledInput
                  id="title"
                  type="text"
                  placeholder="Business Consultant at Utumishi"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 2, message: 'Title must be at least 2 characters' },
                  })}
                />
              </Field>

              {/* Location */}
              <Field
                label="Location"
                required
                errorText={errors.location?.message as string}
              >
                <StyledInput
                  id="location"
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  {...register('location', {
                    required: 'Location is required',
                    minLength: { value: 2, message: 'Location must be at least 2 characters' },
                  })}
                />
              </Field>

              {/* About */}
              <Field
                label="About"
                required
                errorText={errors.about?.message as string}
                helperText="At least 100 characters recommended"
              >
                <StyledTextarea
                  id="about"
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  rows={6}
                  {...register('about', {
                    required: 'About is required',
                    minLength: { value: 100, message: 'About must be at least 100 characters' },
                  })}
                />
              </Field>
            </SimpleGrid>
          </VStack>
        </Box>
      </Flex>
    </VStack>
  );
}