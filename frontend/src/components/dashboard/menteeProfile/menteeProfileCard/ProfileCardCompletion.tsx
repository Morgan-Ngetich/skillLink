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

export default function ProfileCompletionCard({ onEditProfile }: ProfileCompletionCardProps) {
  const { profileCompletionStatus } = useProfile()
  
  if (!profileCompletionStatus) return null
  console.log("profileCompletionStatus", profileCompletionStatus)

  // Find the first incomplete step
  const firstIncompleteStep = profileCompletionStatus?.missing_fields[0]?.step|| 'basic'

  // Handle click - open modal at first incomplete step
  const handleCompleteProfile = () => {
    onEditProfile(firstIncompleteStep)
  }

  return (
    <Box
      bgGradient="to-br"
      gradientFrom={{base: "purple.200", _dark: "purple.950"}}
      gradientTo={{base: "blue.200", _dark: "blue.900"}}
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
            color={profileCompletionStatus?.completion_percentage >= 80 ? 'green.500' : 'blue.500'}
          >
            {profileCompletionStatus?.completion_percentage}%
          </Text>
        </Flex>

        <Box>
          <Progress
            value={profileCompletionStatus?.completion_percentage }
            size="sm"
            colorPalette={profileCompletionStatus?.completion_percentage  >= 80 ? 'green' : 'blue'}
            borderRadius={"lg"}
          />
          <Text fontSize="sm" color="fg.muted" mt={2}>
            {profileCompletionStatus?.completion_percentage  >= 80
              ? 'Almost there! Just a few more steps.'
              : 'A complete profile helps mentors understand you better.'}
          </Text>
        </Box>

        <VStack align="stretch" gap={2} mt={2}>
          {profileCompletionStatus?.missing_fields.slice(0, 3).map((item, id: number) => (
            <Flex key={id} align="center" gap={2}>
              <Box color="fg.subtle">
                <LuCircle size={16} />
              </Box>
              <Text fontSize="sm" color="fg.muted">
                {item.label}
              </Text>
            </Flex>
          ))}

          {profileCompletionStatus?.missing_fields.length > 3 && (
            <Text fontSize="sm" color="gray.500" ml={6}>
              +{profileCompletionStatus?.missing_fields.length - 3} more items
            </Text>
          )}
        </VStack>

        <Button
          colorScheme="blue"
          onClick={handleCompleteProfile}
          size="md"
          w="full"
        >
          {profileCompletionStatus?.completion_percentage === 0 
            ? 'Start Profile Setup' 
            : profileCompletionStatus?.completion_percentage  === 100 
            ? 'View Profile' 
            : 'Complete Profile'}
        </Button>
      </VStack>
    </Box>
  )
}