'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  VStack,
} from '@chakra-ui/react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import {
  LuUser,
  LuHeartHandshake,
  LuMessageSquare,
  LuCheck,
  LuActivity,
} from 'react-icons/lu';
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import {
  StepsItem,
  StepsRoot,
  StepsList,
  StepsContent,
  // StepsCompletedContent,
} from '../ui/steps';
import { useProfile } from '@/hooks/useProfile';
import type { UserProfileCreate } from '@/client';

import Step1BasicInfo from './forms/Step1BasicInfo';
import Step2AreaOfFocus from './forms/Step2AreaOfFocus';
import Step3GoalsInterests from './forms/Step3GoalsInterests';
import Step4InterestsSkills from "./forms/Step4InterestsSkills"
import { useAuthRouteGuard } from '@/hooks/auth/useAuthRouteGuard';

const steps = [
  {
    title: 'Your Name',
    description: 'Provide your basic info',
    icon: <LuUser />,
    content: <Step1BasicInfo />,
  },
  {
    title: 'Focus',
    description: 'Choose your focus',
    icon: <LuHeartHandshake />,
    content: <Step2AreaOfFocus />,
  },
  {
    title: 'Goals & Interests',
    description: 'Set your goals',
    icon: <LuMessageSquare />,
    content: <Step3GoalsInterests />,
  },
  {
    title: 'Interests & Skills',
    description: 'What you love & can do',
    icon: <LuActivity />,
    content: <Step4InterestsSkills />,
  },
];

export default function ProfileSetup() {
  const router = useRouter();
  const navigate = useNavigate()
  const { isBlocked, isLoading } = useAuthRouteGuard()

  const { step: stepParam, redirectTo } = useSearch({ from: '/_layout/profile-setup' });

  const stepIndex = Math.max(0, Math.min(Number(stepParam) - 1 || 0, steps.length - 1));
  const setStepInUrl = (index: number) => {
    router.navigate({
      to: "/profile-setup",
      search: { step: index + 1, redirectTo },
      replace: true,
    });
  };

  const { updateProfileAll, isSubmitting } = useProfile();

  const methods = useForm<UserProfileCreate>({
    defaultValues: {
      location: '',
      bio: '',
      goals: [],
      area_of_focus: [],
      interests: [],
      skills: []
    },
  });

  const { control, handleSubmit } = methods;

  // Validation watches
  const location = useWatch({ control, name: 'location' });
  const bio = useWatch({ control, name: 'bio' });
  // const contactEmail = useWatch({ control, name: 'contact_details.email' });
  // const contactPhone = useWatch({ control, name: 'contact_details.phone' });
  const area_of_focus = useWatch({ control, name: 'area_of_focus' });
  const goals = useWatch({ control, name: 'goals' });
  const interests = useWatch({ control, name: 'interests' });
  const skills = useWatch({ control, name: 'skills' });

  const isStepValid = (index: number) => {
    if (index === 0) {
      // Basic info: location, bio, and at least email required
      return !!location?.trim() &&
        !!bio?.trim()
      // !!contactEmail?.trim() &&
      // !!contactPhone &&
      // /\S+@\S+\.\S+/.test(contactEmail); // Basic email validation
    }
    if (index === 1) {
      // Focus areas: at least one area selected
      return Array.isArray(area_of_focus) && area_of_focus.length > 0;
    }
    if (index === 2) {
      // Goals: at least 2 goals
      return Array.isArray(goals) && goals.length >= 2;
    }
    if (index === 3) {
      // Interests & Skills: at least 2 interests and 1 skill
      return Array.isArray(interests) && interests.length >= 2 &&
        Array.isArray(skills) && skills.length >= 1;
    }
    return false;
  };


  const onStepChange = (nextStep: number) => {
    if (nextStep <= stepIndex || isStepValid(stepIndex)) {
      setStepInUrl(nextStep);
    }
  };

  const onSubmit = async (data: UserProfileCreate) => {
    await updateProfileAll(data, {
      onSuccess: async () => {
        await navigate({ to: redirectTo || "/dashboard/profile" })
      },
      onError: (err) => console.error(err),
    });
  };

  if (isLoading || isBlocked) {
    // TODO return the pages' skeletopn structure. 
    return null
  }

  return (
    <FormProvider {...methods}>
      <Flex
        maxW="5xl"
        mx="auto"
        minH="calc(100vh - 70px)"
        px={{ base: 4, md: 10 }}
        justifyContent="center"
        alignItems="center"
        direction={{ base: 'column', md: 'row' }}
        mb={10}
      >
        <StepsRoot
          step={stepIndex}
          // onStepChange={onStepChange}
          count={steps.length}
          orientation={{ base: 'horizontal', md: 'vertical' }}
          h="full"
        >
          <StepsList maxH={"90vh"}>
            {steps.map((step, index) => (
              <StepsItem
                key={index}
                index={index}
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

          {steps.map((step, index) => (
            <StepsContent
              key={index}
              index={index}
              w="full"
              px={{ base: 0, md: 10 }}
              py={{ base: 6, md: 10 }}
              transition="opacity 0.3s"
            >
              <VStack align="stretch" gap={6}>
                <Heading as="h3" fontSize="xl" borderBottom="1px solid" pb={4}>
                  Step {index + 1} / {steps.length}
                </Heading>

                {step.content}

                <ButtonGroup pt={6} justifyContent="space-between" w="100%">
                  <Button
                    onClick={() => onStepChange(stepIndex - 1)}
                    disabled={stepIndex === 0}
                    variant="outline"
                  >
                    Back
                  </Button>
                  {stepIndex === steps.length - 1 ? (
                    <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} colorPalette={"green"}>
                      Finish
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onStepChange(stepIndex + 1)}
                      disabled={!isStepValid(stepIndex)}
                    >
                      Next
                    </Button>
                  )}
                </ButtonGroup>
              </VStack>
            </StepsContent>
          ))}

          {/* <StepsCompletedContent>All steps are complete!</StepsCompletedContent> */}
        </StepsRoot>
      </Flex>
    </FormProvider>
  );
}
