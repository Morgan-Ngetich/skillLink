import { Button, VStack, Box, Heading, Text, HStack } from '@chakra-ui/react'
import { LuSparkles, LuUsers, LuTrendingUp, LuHeart } from 'react-icons/lu'
import { useProfile } from '@/hooks/public/useProfile'
import { useAuth } from '@/hooks/auth/useAuth'
import { useRouter } from '@tanstack/react-router'
import useToaster from '@/hooks/public/useToaster'

export default function BecomeMentorButton() {
  const { profile, profileCompletionStatus } = useProfile()
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToaster()

  const handleBecomeMentor = () => {
    // Check if already a mentor
    if (user?.is_mentor) {
      router.navigate({
        to: '/dashboard/mentor',
      })
      return
    }

    // Check if user profile is complete
    if (!profile?.is_profile_complete) {
      const missingFields = profileCompletionStatus?.missing_fields || []
      const nextStep = missingFields[0]?.step || 'basic'

      toast({
        id: "complete-profile-first",
        title: 'Complete your profile first',
        description: 'You need to complete your profile before becoming a mentor',
        status: 'warning',
      })

      // Open profile setup modal with redirect param
      router.navigate({
        to: `/profile/${user?.uuid}`,
        search: {
          drawer: 'setup-profile',
          step: nextStep,
          redirectTo: 'mentor-setup', // Simple flag instead of full URL
        },
      })
      return
    }

    // Open mentor setup modal
    router.navigate({
      to: `/profile/${user?.uuid}`,
      search: { drawer: 'mentor-setup', step: 'expertise' },
    })
  }

  // If already a mentor, show different CTA
  if (user?.is_mentor) {
    return (
      <Button
        colorScheme="green"
        size="lg"
        onClick={handleBecomeMentor}
      >
        Mentor Dashboard
      </Button>
    )
  }

  return (
    <Box
      bgGradient="to-br"
      gradientFrom={{ base: "purple.200", _dark: "purple.950" }}
      gradientTo={{ base: "blue.200", _dark: "blue.900" }}
      p={8}
      borderRadius="2xl"
      border="2px solid"
      borderColor="purple.200"
      boxShadow="lg"
      w="full"
    >
      <VStack gap={6} align="start">
        <Box>
          <HStack mb={2}>
            <LuSparkles size={32} color="purple" />
            <Heading size="xl">Become a Mentor</Heading>
          </HStack>
          <Text color="fg.muted">
            Share your knowledge and help the next generation of professionals
          </Text>
        </Box>

        <VStack align="start" gap={3} w="full">
          <HStack>
            <Box color="green.500">
              <LuUsers size={20} />
            </Box>
            <Text fontSize="sm">Connect with mentees seeking your expertise</Text>
          </HStack>

          <HStack>
            <Box color="blue.500">
              <LuTrendingUp size={20} />
            </Box>
            <Text fontSize="sm">Build your professional network and reputation</Text>
          </HStack>

          <HStack>
            <Box color="purple.500">
              <LuHeart size={20} />
            </Box>
            <Text fontSize="sm">Make a meaningful impact on others' careers</Text>
          </HStack>
        </VStack>

        <Button
          colorScheme="purple"
          size="lg"
          w="full"
          onClick={handleBecomeMentor}
        >
          <LuSparkles />
          Start Your Mentor Journey
        </Button>
      </VStack>
    </Box>
  )
}