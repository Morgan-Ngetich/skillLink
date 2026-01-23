import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { DialogRoot, DialogContent, DialogBody, DialogFooter, Field } from '@/components/ui'
import {
  LuX,
  LuPlus,
  LuSparkles,
  LuBriefcase,
} from 'react-icons/lu'
import { useAuth } from '@/hooks/auth/useAuth'
import { useRouter } from '@tanstack/react-router'
import {
  type MentorProfileCreate,
  type ExperienceLevel,
} from '@/client'
import { useMentorProfile } from '@/hooks/mentor/useMentorProfile'
import { Tag, Alert } from '@/components/ui'
import { BsFillPatchCheckFill } from "react-icons/bs";
import { useProfile } from '@/hooks/public/useProfile'

interface MentorSetupModalProps {
  isOpen: boolean
  onClose: () => void
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['junior', 'mid', 'senior'] as ExperienceLevel[]

export default function MentorProfileSetupModal({
  isOpen,
  onClose,
}: MentorSetupModalProps) {
  const { updateMentorProfileAll, isSubmitting } = useMentorProfile()
  const { user } = useAuth()
  // console.log(user)
  const router = useRouter()
  const { profile } = useProfile()
  const { mentorProfile } = useMentorProfile()


  const [formData, setFormData] = useState<MentorProfileCreate>({
    user_id: user?.id || 0,
    title: mentorProfile?.title || profile?.title || '',
    industries: mentorProfile?.industries || [],
    expertise: mentorProfile?.expertise || profile?.area_of_focus || [],
    experience_level: mentorProfile?.experience_level || 'mid',
  })

  const [newIndustry, setNewIndustry] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({ ...prev, user_id: user.id }))
    }
  }, [isOpen, user])

  const toTitleCase = (text: string) =>
    text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

  const addIndustry = () => {
    const value = toTitleCase(newIndustry.trim());
    if (!value) return;

    // Handle null/undefined with nullish coalescing operator
    const currentIndustries = formData.industries ?? [];

    // Check for duplicates
    if (currentIndustries.includes(value)) return;

    setFormData({
      ...formData,
      industries: [...currentIndustries, value]
    });

    setNewIndustry('');
  };

  const removeIndustry = (index: number) => {
    // Handle null/undefined by providing a default empty array
    const currentIndustries = formData.industries ?? [];

    // Create a copy of the array
    const updated = [...currentIndustries];

    // Remove the item at the specified index
    updated.splice(index, 1);

    // Update form data
    setFormData({
      ...formData,
      industries: updated
    });
  };

  const addExpertise = () => {
    const value = toTitleCase(newExpertise.trim())
    if (!value) return
    if (formData.expertise.includes(value)) return

    setFormData({
      ...formData,
      expertise: [...formData.expertise, value]
    })
    setNewExpertise('')
  }

  const removeExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index)
    })
  }

  const isValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.industries && formData.industries.length >= 1 &&
      formData.expertise && formData.expertise.length >= 1 &&
      formData.experience_level
    )
  }

  const handleSubmit = async () => {
    if (!isValid()) {
      setError('Please fill in all required fields')
      return
    }

    await updateMentorProfileAll(formData, {
      onSuccess: () => {
        router.navigate({ to: `/profile/${user?.uuid}` })
        onClose()
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to create mentor profile')
        }
      },
    })
  }

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size={{ base: 'full', md: 'lg' }}
    >
      <DialogContent>
        <DialogBody maxH={{ base: '100vh', md: '90vh' }} overflowY="auto" px={{ base: 4, md: 6 }} py={6}>
          <VStack gap={6} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="start">
              <Box>
                <HStack>
                  <LuBriefcase size={24} />
                  <Heading size="xl">Become a Mentor</Heading>
                </HStack>
                <Text fontSize="sm" color="fg.muted">
                  Share your expertise and help others grow.
                </Text>
              </Box>
              <IconButton
                aria-label="Close"
                variant="ghost"
                onClick={onClose}
                colorPalette="red"
                size="sm"
              >
                <LuX />
              </IconButton>
            </Flex>

            {/* Success Message */}
            <Box bg="blue.50" p={{ base: 3, md: 4 }} borderRadius="lg" border="1px solid" borderColor="blue.200">
              <HStack>
                <VStack align="start" gap={1}>
                  <HStack>
                    <LuSparkles size={24} color="blue" />
                    <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                      Your profile will be live immediately!
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="blue.600">
                    You can add services, availability, and more details later from your profile settings.
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {error && (
              <Alert status="error" title="Error">
                {error}
              </Alert>
            )}

            {/* Form Fields */}
            <VStack gap={8} align="stretch">
              {/* Professional Title */}
              <Field label="Professional Title" required>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer at Google"
                // size="lg"
                />
              </Field>

              {/* Industries */}
              <Field
                label="Industries"
                required
                helperText="List the industries you’re involved in (e.g., Tech, Education, Design)"
              >
                <VStack align="stretch" gap={3} w="full">
                  <HStack>
                    <Input
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      placeholder="e.g., Software, Education, Finance"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addIndustry()
                        }
                      }}
                    />
                    <IconButton
                      aria-label="Add industry"
                      onClick={addIndustry}
                      disabled={!newIndustry.trim()}
                    >
                      <LuPlus />
                    </IconButton>
                  </HStack>

                  {formData.industries && formData.industries.length > 0 && (
                    <Flex gap={2} flexWrap="wrap">
                      {formData.industries.map((item, i) => (
                        <Tag
                          key={i}
                          size="xl"
                          colorPalette="blue"
                          closable
                          onClose={() => removeIndustry(i)}
                        >
                          {item}
                        </Tag>
                      ))}
                    </Flex>
                  )}
                </VStack>
              </Field>


              {/* Experience Level */}
              <Field label="Experience Level" required>
                <Flex gap={2} flexWrap="wrap">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <Button
                      key={level}
                      variant={formData.experience_level === level ? "solid" : "outline"}
                      colorPalette={formData.experience_level === level ? "orange" : "gray"}
                      onClick={() =>
                        setFormData({ ...formData, experience_level: level })
                      }
                      textTransform="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </Flex>

              </Field>

              {/* Expertise */}
              <Field
                label="Areas of Expertise"
                required
                helperText="Add at least one area you can mentor in"
              >
                <VStack align="stretch" gap={3} w="full">
                  <HStack >
                    <Input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="e.g., Career Transitions, System Design, Frontend Development"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addExpertise()
                        }
                      }}
                    // size="lg"
                    />
                    <IconButton
                      aria-label="Add expertise"
                      onClick={addExpertise}
                      disabled={!newExpertise.trim()}
                    >
                      <LuPlus />
                    </IconButton>
                  </HStack>
                  {formData.expertise.length > 0 && (
                    <Flex gap={2} flexWrap="wrap">
                      {formData.expertise.map((item, i) => (
                        <Tag
                          key={i}
                          size="xl"
                          colorPalette="orange"
                          closable
                          onClose={() => removeExpertise(i)}
                        >
                          {item}
                        </Tag>
                      ))}
                    </Flex>
                  )}

                </VStack>
              </Field>
            </VStack>

            {/* Info Box */}
            <Box bg="cardbg" p={4} borderRadius="lg" border="1px dashed" borderColor="gray.300">
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="semibold">
                  What happens next?
                </Text>
                <VStack align="start" gap={1} fontSize="xs" color="fg.muted">
                  <HStack>
                    <BsFillPatchCheckFill color="greenyellow" />
                    <Text> Your mentor profile goes live immediately</Text>
                  </HStack>

                  <HStack>
                    <BsFillPatchCheckFill color="greenyellow" />
                    <Text> You'll get the "Mentor" badge on your profile</Text>
                  </HStack>
                  <HStack>
                    <BsFillPatchCheckFill color="greenyellow" />
                    <Text> You can add services and availability from settings</Text>
                  </HStack>

                  <HStack>
                    <BsFillPatchCheckFill color="greenyellow" />
                    <Text>Mentees can discover and connect with you</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Flex w="full" justify="space-between" gap={3}>
            <Button variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!isValid()}
              size="lg"
              flex={1}
            >
              <LuSparkles />
              Become a Mentor
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}