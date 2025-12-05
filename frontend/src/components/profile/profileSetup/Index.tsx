import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  VStack,
  Text
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
} from '@/components/ui/steps';
import { useProfile } from '@/hooks/public/useProfile';
import type { UserProfileCreate } from '@/client';

import Step1BasicInfo from './forms/Step1BasicInfo';
import Step2AreaOfFocus from './forms/Step2AreaOfFocus';
import Step3GoalsInterests from './forms/Step3GoalsInterests';
import Step4InterestsSkills from "./forms/Step4InterestsSkills"
import { useAuthRouteGuard } from '@/hooks/auth/useAuthRouteGuard';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

const steps = [
  {
    title: 'Personal Information',
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
    description: 'Set your goals & interest',
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
  const { isBlocked, isLoading: authLoading } = useAuthRouteGuard()

  const { step: stepParam, redirectTo } = useSearch({ from: '/_layout/profile-setup' });

  const { user } = useAuth();
  const { profile, isLoading: profileLoading, updateProfileAll, isSubmitting } = useProfile();

  const methods = useForm<UserProfileCreate>({
    defaultValues: {
      location: '',
      title: '',
      about: '',
      goals: [],
      area_of_focus: [],
      interests: [],
      skills: []
    },
  });

  const { control, handleSubmit, reset } = methods;

  // Prefetch existing profile data
  useEffect(() => {
    if (profile) {
      reset({
        location: profile.location || '',
        title: profile.title || '',
        about: profile.about || '',
        goals: profile.goals || [],
        area_of_focus: profile.area_of_focus || [],
        interests: profile.interests || [],
        skills: profile.skills || []
      });
    }
  }, [profile, reset]);

  // Validation watches
  const title = useWatch({ control, name: "title" })
  const location = useWatch({ control, name: 'location' });
  const about = useWatch({ control, name: 'about' });
  const area_of_focus = useWatch({ control, name: 'area_of_focus' });
  const goals = useWatch({ control, name: 'goals' });
  const interests = useWatch({ control, name: 'interests' });
  const skills = useWatch({ control, name: 'skills' });

  const isStepValid = (index: number) => {
    if (index === 0) {
      return !!title?.trim() && !!location?.trim() && !!about?.trim()
    }
    if (index === 1) {
      return Array.isArray(area_of_focus) && area_of_focus.length > 0;
    }
    if (index === 2) {
      return Array.isArray(goals) && goals.length >= 2;
    }
    if (index === 3) {
      return Array.isArray(interests) && interests.length >= 2 &&
        Array.isArray(skills) && skills.length >= 1;
    }
    return false;
  };

  // Check if all steps are valid
  const allStepsValid = [0, 1, 2, 3].every(isStepValid);

  // Determine initial step
  const getInitialStep = () => {
    if (stepParam) return Math.max(0, Math.min(Number(stepParam) - 1 || 0, steps.length - 1));

    // If all steps are valid, go to last step
    if (allStepsValid) return steps.length - 1;

    // Otherwise, find first invalid step
    for (let i = 0; i < steps.length; i++) {
      if (!isStepValid(i)) return i;
    }
    return 0;
  };

  const stepIndex = getInitialStep();

  const setStepInUrl = (index: number) => {
    router.navigate({
      to: "/profile-setup",
      search: { step: index + 1, redirectTo },
      replace: true,
    });
  };

  const onStepChange = (nextStep: number) => {
    if (nextStep <= stepIndex || isStepValid(stepIndex)) {
      setStepInUrl(nextStep);
    }
  };

  const onSubmit = async (data: UserProfileCreate) => {
    await updateProfileAll(data, {
      onSuccess: async () => {
        await navigate({ to: redirectTo || `profile/${user?.uuid}` })
      },
      onError: (err: unknown) => console.error(err),
    });
  };

  if (authLoading || profileLoading || isBlocked) {
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
                <Box pb={4} borderBottom={"1px solid"}>
                  <Heading as="h3" fontSize="xl">
                    {steps[index].title}
                  </Heading>
                  <Text color="fg.muted" fontSize={"sm"}>
                    {steps[index].description}
                  </Text>
                </Box>

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
                    <Button
                      onClick={handleSubmit(onSubmit)}
                      loading={isSubmitting}
                      colorPalette={"green"}
                    >
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
        </StepsRoot>
      </Flex>
    </FormProvider>
  );
}