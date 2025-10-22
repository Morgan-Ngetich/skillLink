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
  // const contactEmail = useWatch({ control, name: 'contact_details.email' });
  // const contactPhone = useWatch({ control, name: 'contact_details.phone' });

  const isStepComplete = !!title.trim() && !!location?.trim() && !!about?.trim()
  // !!contactEmail?.trim() &&
  // /\S+@\S+\.\S+/.test(contactEmail);

  return (
    <VStack gap={8} align="stretch" mx="auto" w="full" maxW="6xl" px={4}>
      {!isStepComplete && (
        <Alert status="info" borderRadius="md" fontSize="sm" p={2}>
          Please fill in your basic information and contact details to continue.
        </Alert>
      )}

      <Flex
        direction={{ base: 'column', lg: 'row' }}
        justify="space-between"
        gap={8}
        w="full"
      >
        {/* Profile Card Preview */}
        <Box flex="1" maxW={{ base: 'full', lg: '500px' }}>
          <UserProfileCard />
        </Box>

        {/* Editable Info */}
        <Box flex="2" w="full">
          <VStack gap={6} align="stretch">
            {/* Personal Information */}
            <Box>
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
                    placeholder="Tell us about yourself..."
                    {...register('about', {
                      required: 'About is required',
                      minLength: { value: 100, message: 'About must be at least 100 characters' },
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
              </SimpleGrid>
            </Box>


            {/* Contact Information */}
            {/* <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="fg.muted">
                Contact Details
              </Text>

              <SimpleGrid columns={{ base: 1, md: 1 }} gap={4}>
                <FormControl isInvalid={!!errors.contact_details?.email}>
                  <FormLabel htmlFor="email">Email Address *</FormLabel>
                  <StyledInput
                    id="email"
                    type="email"
                    {...register('contact_details.email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    placeholder="your.email@example.com"
                  />
                  <FormErrorMessage>
                    {errors.contact_details?.email?.message as string}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.contact_details?.phone}>
                  <FormLabel htmlFor="phone">Phone Number (Optional)</FormLabel>
                  <StyledInput
                    id="phone"
                    type="tel"
                    {...register('contact_details.phone', {
                      pattern: {
                        value: /^[\+]?[(]?[\d\s\-\(\)]{10,}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    placeholder="+1 (555) 123-4567"
                  />
                  <FormErrorMessage>
                    {errors.contact_details?.phone?.message as string}
                  </FormErrorMessage>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Include country code for international numbers
                  </Text>
                </FormControl>
              </SimpleGrid>
            </Box> */}
          </VStack>
        </Box>
      </Flex>
    </VStack>
  );
}