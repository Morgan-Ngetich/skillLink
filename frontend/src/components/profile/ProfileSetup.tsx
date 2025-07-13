'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  VStack,
  Text,
  Heading,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { LuUser, LuCheck, LuHeartHandshake, LuMessageSquare } from 'react-icons/lu';
import Step1BasicInfo from './forms/Step1BasicInfo';
import Step2AreaOfFocus from './forms/Step2AreaOfFocus'
import Step3GoalsInterests from './forms/Step3GoalsInterests';


// Import the reusable step components
import {
  StepsItem,
  StepsRoot,
  StepsList,
  StepsContent,
  StepsCompletedContent,
  StepsNextTrigger,
  StepsPrevTrigger,
} from '../ui/steps';

const stepItems = [
  {
    title: 'Your Name',
    description: 'Browse and upload',
    icon: <LuUser />,
    content: <Step1BasicInfo />,
  },
  {
    title: 'Describes',
    description: 'Browse and upload',
    icon: <LuHeartHandshake />,
    content: <Step2AreaOfFocus />,
  },
  {
    title: 'Services',
    description: 'Browse and upload',
    icon: <LuMessageSquare />,
    content: <Step3GoalsInterests />,
  },
];

export default function ProfileSetup() {
  const methods = useForm({
    defaultValues: {
      location: '',
      bio: '',
      goals: [],
      interests: [],
    },
  });

  const onSubmit = (data: any) => {
    console.log('Submitting form:', data);
    const goals = data.goals || [];
    const interests = data.interests || [];

    console.log('Goals:', goals);
    console.log('Interests:', interests);
    // await UserService.updateProfile(data);
  };

  return (
    <FormProvider {...methods}>
      <Flex
        maxW="5xl"
        mx="auto"
        minH="calc(100vh - 70px)"
        px={4}
        justifyContent="center"
        alignItems="center"
        direction={{ base: 'column', md: 'row' }}
      >
        <StepsRoot
          count={stepItems.length}
          orientation={{ base: 'horizontal', md: 'vertical' }}
          key={methods.watch()}
          minH={"500px"}
        >
          <StepsList>
            {stepItems.map((step, index) => (
              <StepsItem
                key={index}
                index={index}
                // title={step.title}
                // description={step.description}
                icon={
                  <Box
                    boxSize="32px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box as={step.icon.type} boxSize="18px" />
                  </Box>
                }
                completedIcon={
                  <Box
                    boxSize="32px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <LuCheck size={18} />
                  </Box>
                }
              />
            ))}
          </StepsList>

          {/* Right Form Card */}
          <Box
            flex="1"
            borderRadius="lg"
            px={{ base: 4, md: 10 }}
            py={{ base: 6, md: 10 }}
          >
            {stepItems.map((step, index) => (
              <StepsContent key={index} index={index}>
                <VStack align="stretch" gap={6}>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    borderBottom="1px solid"
                    pb={4}
                  >
                    Step {index + 1}/{stepItems.length}
                  </Heading>

                  {step.content}

                  <ButtonGroup pt={6} justifyContent="space-between" w="full">
                    <StepsPrevTrigger asChild>
                      <Button variant="ghost" border="1px solid">
                        Back
                      </Button>
                    </StepsPrevTrigger>
                    <StepsNextTrigger asChild>
                      <Button colorScheme="green">
                        {index === stepItems.length - 1 ? 'Finish' : 'Next Step'}
                      </Button>
                    </StepsNextTrigger>
                  </ButtonGroup>
                </VStack>
              </StepsContent>
            ))}

            <StepsCompletedContent>
              <VStack mt={10} gap={6}>
                <Text color="white" fontSize="lg">
                  🎉 You're done! Let’s finalize your profile.
                </Text>
                <Button
                  size="lg"
                  colorScheme="teal"
                  onClick={methods.handleSubmit(onSubmit)}
                >
                  Submit Profile
                </Button>
              </VStack>
            </StepsCompletedContent>
          </Box>
        </StepsRoot>
      </Flex>
    </FormProvider>
  );
}
