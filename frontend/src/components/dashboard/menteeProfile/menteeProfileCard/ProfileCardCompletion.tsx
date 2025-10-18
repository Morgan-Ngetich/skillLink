import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { LuCircle, LuSparkles } from 'react-icons/lu'
import { useProfile } from '@/hooks/useProfile'
import { Progress } from '@/components/ui'

interface ProfileCompletionCardProps {
  onEditProfile: (stepId?: string) => void // Add optional stepId parameter
}

interface CompletionItem {
  id: string
  label: string
  isComplete: boolean
  weight: number
  stepId: string // Add stepId to map to modal steps
}

export default function ProfileCompletionCard({ onEditProfile }: ProfileCompletionCardProps) {
  const { profile } = useProfile()

  const completionItems: CompletionItem[] = [
    {
      id: 'bio',
      label: 'Add a bio',
      isComplete: Boolean(profile?.bio && profile.bio.length > 20),
      weight: 15,
      stepId: 'basic', // Maps to the 'basic' step in modal
    },
    {
      id: 'location',
      label: 'Set your location',
      isComplete: Boolean(profile?.location),
      weight: 10,
      stepId: 'basic',
    },
    {
      id: 'experience',
      label: 'Add work experience',
      isComplete: Boolean(profile?.experience && profile.experience.length > 0),
      weight: 20,
      stepId: 'experience',
    },
    {
      id: 'education',
      label: 'Add education',
      isComplete: Boolean(profile?.education && profile.education.length > 0),
      weight: 15,
      stepId: 'education',
    },
    {
      id: 'skills',
      label: 'List your skills (at least 3)',
      isComplete: Boolean(profile?.skills && profile.skills.length >= 3),
      weight: 15,
      stepId: 'skills',
    },
    {
      id: 'interests',
      label: 'Share your interests',
      isComplete: Boolean(profile?.interests && profile.interests.length > 0),
      weight: 10,
      stepId: 'skills',
    },
    {
      id: 'social',
      label: 'Connect social profiles',
      isComplete: Boolean(
        profile?.social_links &&
        (profile.social_links.linkedin || profile.social_links.github)
      ),
      weight: 15,
      stepId: 'social',
    },
  ]

  const completedWeight = completionItems
    .filter(item => item.isComplete)
    .reduce((sum, item) => sum + item.weight, 0)

  const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0)
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100)

  const incompleteItems = completionItems.filter(item => !item.isComplete)

  // Find the first incomplete step
  const firstIncompleteStep = incompleteItems[0]?.stepId || 'basic'

  // Handle click - open modal at first incomplete step
  const handleCompleteProfile = () => {
    onEditProfile(firstIncompleteStep)
  }

  return (
    <Box
      bgGradient={"to-br"}
      gradientFrom={{base: "blue.200", _dark: "blue.700"}}
      gradientTo={{base: "purple.200", _dark: "purple.700"}}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor="blue.100"
      boxShadow="sm"
      w="full"
    >
      <VStack align="stretch" gap={2}>
        <Flex justify="space-between" align="center">
          <HStack>
            <Box color="blue.500">
              <LuSparkles size={40} />
            </Box>
            <Heading size="md">Complete Your Profile</Heading>
          </HStack>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={completionPercentage >= 80 ? 'green.500' : 'blue.500'}
          >
            {completionPercentage}%
          </Text>
        </Flex>

        <Box>
          <Progress
            value={completionPercentage}
            size="sm"
            colorPalette={completionPercentage >= 80 ? 'green' : 'blue'}
            borderRadius={"lg"}
          />
          <Text fontSize="sm" color="fg.muted" mt={2}>
            {completionPercentage >= 80
              ? 'Almost there! Just a few more steps.'
              : 'A complete profile helps mentors understand you better.'}
          </Text>
        </Box>

        <VStack align="stretch" gap={2} mt={2}>
          {incompleteItems.slice(0, 3).map((item) => (
            <Flex key={item.id} align="center" gap={2}>
              <Box color="fg.subtle">
                <LuCircle size={16} />
              </Box>
              <Text fontSize="sm" color="fg.muted">
                {item.label}
              </Text>
            </Flex>
          ))}

          {incompleteItems.length > 3 && (
            <Text fontSize="sm" color="gray.500" ml={6}>
              +{incompleteItems.length - 3} more items
            </Text>
          )}
        </VStack>

        <Button
          colorScheme="blue"
          onClick={handleCompleteProfile}
          size="md"
          w="full"
        >
          {completionPercentage === 0 
            ? 'Start Profile Setup' 
            : completionPercentage === 100 
            ? 'View Profile' 
            : 'Complete Profile'}
        </Button>
      </VStack>
    </Box>
  )
}