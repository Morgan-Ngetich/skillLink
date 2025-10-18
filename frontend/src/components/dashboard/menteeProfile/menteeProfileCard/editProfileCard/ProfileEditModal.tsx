import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Text,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Grid,
  Image,
  Steps,
  // useBreakpointValue,
} from '@chakra-ui/react'
import { DialogRoot, DialogContent, DialogBody, DialogFooter, Field } from '@/components/ui'
import { LuX, LuPlus, LuTrash2, LuArrowLeft, LuArrowRight, LuUser, LuBriefcase, LuGraduationCap, LuStar, LuLink } from 'react-icons/lu'
import { useProfile } from '@/hooks/useProfile'
// import { useAuth } from '@/hooks/auth/useAuth'
// import ProfilePreviewMini from '@/components/dashboard/menteeProfile/ProfilePreviewMini'
import type { UserProfileUpdate, UserProfileCreate } from '@/client'
import { useState, useEffect, useRef } from 'react'
import InstitutionAutocomplete from './InstitutionAutocomplete'
import SocialLinksSelector from './SocialLinksSelector'
import { useRouter, useSearch } from '@tanstack/react-router'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  initialStep: string
}

type Step = 'basic' | 'experience' | 'education' | 'skills' | 'social'

const STEPS: { id: Step; title: string; description: string; icon: React.ElementType }[] = [
  {
    id: 'basic',
    title: 'Basic Info',
    description: 'Tell us about yourself',
    icon: LuUser,
  },
  {
    id: 'experience',
    title: 'Experience',
    description: 'Your work history',
    icon: LuBriefcase,
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Academic background',
    icon: LuGraduationCap,
  },
  {
    id: 'skills',
    title: 'Skills & Interests',
    description: 'What you know and love',
    icon: LuStar,
  },
  {
    id: 'social',
    title: 'Social Links',
    description: 'Connect your profiles',
    icon: LuLink,
  },
]

const EMPTY_EXPERIENCE_ENTRY = {
  company: '',
  position: '',
  description: '',
  start_date: '',
  end_date: '',
  logo: '',
}

const EMPTY_EDUCATION_ENTRY = {
  institution: '',
  degree: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  logo: '',
}

export default function ProfileEditModal({ isOpen, onClose, initialStep = "basic" }: ProfileEditModalProps) {
  const { profile, updateProfileAll, isSubmitting } = useProfile()
  // const { user } = useAuth()
  // const showPreview = useBreakpointValue({ base: false, lg: true })

  const router = useRouter()
  const search = useSearch({ from: "/_layout/dashboard/profile" })

  const getStepIndex = (stepId: string): number => {
    const index = STEPS.findIndex(s => s.id === stepId)
    return index >= 0 ? index : 0
  }

  const [step, setStep] = useState<number>(getStepIndex(initialStep))

  useEffect(() => {
    if (search.step) {
      setStep(getStepIndex(search.step))
    }
  }, [search.step])

  const updateStep = (newStepIndex: number) => {
    setStep(newStepIndex)
    router.navigate({
      to: "/dashboard/profile",
      search: {
        drawer: "setup-profile",
        step: STEPS[newStepIndex].id
      },
      replace: true,
    })
  }

  const goPrev = () => {
    const newStep = Math.max(step - 1, 0)
    updateStep(newStep)
  }

  const goNext = () => {
    const newStep = Math.min(step + 1, STEPS.length - 1)
    updateStep(newStep)
  }


  // Form state - Initialize from profile when modal opens
  const [formData, setFormData] = useState<Partial<UserProfileUpdate | UserProfileCreate>>({
    bio: '',
    location: '',
    area_of_focus: [],
    goals: [],
    interests: [],
    skills: [],
    social_links: {},
    contact_details: {},
    education: [],
    experience: [],
  })

  // Update form data when profile changes or modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        bio: profile.bio || '',
        location: profile.location || '',
        area_of_focus: profile.area_of_focus || [],
        goals: profile.goals || [],
        interests: profile.interests || [],
        skills: profile.skills || [],
        social_links: profile.social_links || {},
        contact_details: profile.contact_details || {},

        // Ensure at least one empty entry for experience and education
        education: profile.education && profile.education.length > 0
          ? profile.education
          : [EMPTY_EDUCATION_ENTRY],
        experience: profile.experience && profile.experience.length > 0
          ? profile.experience
          : [EMPTY_EXPERIENCE_ENTRY],
      })
    }
  }, [isOpen, profile])

  // Temporary input states
  const [newFocus, setNewFocus] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [newSkill, setNewSkill] = useState('')

  const { refetch } = useProfile()

  const handleSubmit = async () => {
    await updateProfileAll(formData, {
      onSuccess: () => {
        onClose()
        // Reset to first step for next time
        setStep(0)
        refetch()
      },
    })
  }

  const addArrayItem = (field: keyof typeof formData, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return
    const current = (formData[field] as string[]) || []
    setFormData({ ...formData, [field]: [...current, value.trim()] })
    setter('')
  }

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    const current = (formData[field] as string[]) || []
    setFormData({ ...formData, [field]: current.filter((_, i) => i !== index) })
  }

  const addExperience = () => {
    const current = formData.experience || []
    setFormData({
      ...formData,
      experience: [...current, EMPTY_EXPERIENCE_ENTRY],
    })
  }

  const updateExperience = (index: number, field: string, value: string | null) => {
    setFormData(prev => {
      const updated = [...(prev.experience || [])]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, experience: updated }
    })
  }


  const removeExperience = (index: number) => {
    setFormData(prev => {
      const current = prev.experience || [];
      const updated = current.filter((_, i) => i !== index);

      //  keep at least one blank card
      return {
        ...prev,
        experience: updated.length > 0 ? updated : [EMPTY_EXPERIENCE_ENTRY]
      };
    });
  };

  const addEducation = () => {
    const current = formData.education || []
    setFormData({
      ...formData,
      education: [...current, EMPTY_EDUCATION_ENTRY]
    })
  }

  const updateEducation = (index: number, field: string, value: string | null) => {
    setFormData(prev => {
      const updated = [...(prev.education || [])]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, education: updated }
    })
  }


  const removeEducation = (index: number) => {
    setFormData(prev => {
      const current = prev.education || [];
      const updated = current.filter((_, i) => i !== index);

      //  keep at least one blank card
      return {
        ...prev,
        education: updated.length > 0 ? updated : [EMPTY_EDUCATION_ENTRY]
      };
    });
  };

  const educationEndRef = useRef<HTMLDivElement | null>(null)
  const experienceEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToEnd = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => scrollToEnd(educationEndRef), [formData.education?.length])
  useEffect(() => scrollToEnd(experienceEndRef), [formData.experience?.length])

  const renderBasicInfo = () => (
    <VStack gap={4} align="stretch">
      <Field label="Bio" required>
        <Textarea
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
          rows={4}
          fontSize={{ base: "sm", md: "md" }}
        />
      </Field>

      <Field label="Location" required>
        <Input
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., Nairobi, Kenya"
          fontSize={{ base: "sm", md: "md" }}
        />
      </Field>

      <Field label="Areas of Focus">
        <VStack align="stretch" gap={2}>
          <HStack>
            <Input
              value={newFocus}
              onChange={(e) => setNewFocus(e.target.value)}
              placeholder="Add area of focus"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem('area_of_focus', newFocus, setNewFocus)
                }
              }}
            />
            <IconButton
              aria-label="Add focus"
              onClick={() => addArrayItem('area_of_focus', newFocus, setNewFocus)}
              size={'sm'}
            >
              <LuPlus />
            </IconButton>
          </HStack>
          <Flex gap={2} flexWrap="wrap">
            {(formData.area_of_focus || []).map((focus: string, i: number) => (
              <HStack
                key={i}
                bg={{ base: "blue.200", _dark: "blue.500" }}
                px={3}
                // py={0}
                borderRadius="full"
                fontSize="sm"
              >
                <Text>{focus}</Text>
                <IconButton
                  aria-label="Remove"
                  size="xs"
                  variant="plain"
                  onClick={() => removeArrayItem('area_of_focus', i)}
                >
                  <LuX size={14} />
                </IconButton>
              </HStack>
            ))}
          </Flex>
        </VStack>
      </Field>

      <Field label="Goals">
        <VStack align="stretch" gap={2}>
          <HStack>
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a goal"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem('goals', newGoal, setNewGoal)
                }
              }}
            />
            <IconButton
              aria-label="Add goal"
              onClick={() => addArrayItem('goals', newGoal, setNewGoal)}
              size={'sm'}
            >
              <LuPlus />
            </IconButton>
          </HStack>
          <Flex gap={2} flexWrap="wrap">
            {(formData.goals || []).map((goal: string, i: number) => (
              <HStack
                key={i}
                bg={{ base: "green.200", _dark: "green.focusRing" }}
                px={3}
                // py={1}
                borderRadius="full"
                fontSize="sm"
              >
                <Text>{goal}</Text>
                <IconButton
                  aria-label="Remove"
                  size="xs"
                  variant="plain"
                  onClick={() => removeArrayItem('goals', i)}
                >
                  <LuX size={14} />
                </IconButton>
              </HStack>
            ))}
          </Flex>
        </VStack>
      </Field>
    </VStack>
  )

  const renderExperience = () => (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" color="fg.muted">
          Add your work experience
        </Text>
        <Button size="sm" onClick={addExperience}>
          <LuPlus />
          Add Experience
        </Button>
      </HStack>

      {(formData.experience || []).map((exp, i) => (
        <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg={{ base: "gray.50", _dark: "gray.900" }}>
          <Flex justify="space-between" align="center" mb={3}>
            <HStack align={'center'}>
              {exp.logo && (
                <Image
                  src={exp?.logo}
                  alt="Experience"
                  boxSize="40px"
                  borderRadius="sm"
                  objectFit="cover"
                />
              )}
              <Text fontWeight="semibold">Experience {i + 1}</Text>
            </HStack>
            {/* Only show tracj if more that 1 card */}
            {(formData.experience || []).length > 1 && (
              <IconButton
                aria-label="Remove experience"
                size="sm"
                colorPalette="red"
                variant="ghost"
                onClick={() => removeExperience(i)}
              >
                <LuTrash2 />
              </IconButton>
            )}
          </Flex>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
            <Field label="Company">
              <InstitutionAutocomplete
                value={exp.company || ''}
                placeholder="Start typing company name..."
                onChange={(value) => updateExperience(i, 'company', value)}
                onSelect={(suggestion) => {
                  updateExperience(i, 'company', suggestion.name)
                  updateExperience(i, 'logo', suggestion?.logo || null)
                }}
                type="company"
              />
            </Field>

            <Field label="Position">
              <Input
                value={exp.position || ''}
                onChange={(e) => updateExperience(i, 'position', e.target.value)}
                placeholder="Your role"
                fontSize={{ base: "sm", md: "md" }}
              />
            </Field>

            <Field label="Start Date">
              <Input
                type="date"
                value={exp.start_date ? exp.start_date.split('T')[0] : ''}
                onChange={(e) => updateExperience(i, 'start_date', e.target.value + 'T00:00:00')}
              />
            </Field>

            <Field label="End Date">
              <Input
                type="date"
                value={exp.end_date ? exp.end_date.split('T')[0] : ''}
                onChange={(e) => updateExperience(i, 'end_date', e.target.value + 'T00:00:00')}
              />
            </Field>
          </Grid>
          <Box mt={2}>
            <Field label="Description">
              <Textarea
                value={exp.description || ''}
                onChange={(e) => updateExperience(i, 'description', e.target.value)}
                placeholder="What did you do?"
                rows={5}
              />
            </Field>
          </Box>
        </Box>
      ))}
      <div ref={experienceEndRef} />
    </VStack>
  )

  const renderEducation = () => (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" color="fg.muted">
          Add your educational background
        </Text>
        <Button size="sm" onClick={addEducation}>
          <LuPlus />
          Add Education
        </Button>
      </HStack>

      {(formData.education || []).map((edu, i) => (
        <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg={{ base: "gray.50", _dark: "gray.900" }}>
          <Flex justify="space-between" align="center" mb={3}>
            <HStack align={'center'}>
              {edu.institution && (
                <Image
                  src={edu?.logo}
                  alt="Experience"
                  boxSize="40px"
                  borderRadius="sm"
                  objectFit="cover"
                />
              )}
              <Text fontWeight="semibold">Education {i + 1}</Text>
            </HStack>
            {(formData.education || []).length > 1 && (
              <IconButton
                aria-label="Remove education"
                size="sm"
                colorPalette="red"
                variant="ghost"
                onClick={() => removeEducation(i)}
              >
                <LuTrash2 />
              </IconButton>
            )}
          </Flex>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
            <Field label="Institution">
              <InstitutionAutocomplete
                value={edu.institution || ''}
                placeholder="Start typing university name..."
                onChange={(value) => updateEducation(i, 'institution', value)}
                onSelect={(suggestion) => {
                  updateEducation(i, 'institution', suggestion.name)
                  updateEducation(i, 'logo', suggestion.logo || null)
                }}
                type="instituition"
              />
            </Field>

            <Field label="Degree">
              <Input
                value={edu.degree || ''}
                onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                placeholder="e.g., BSc Computer Science"
                fontSize={{ base: "sm", md: "md" }}
              />
            </Field>

            <Field label="Field of Study">
              <Input
                value={edu.field_of_study || ''}
                onChange={(e) => updateEducation(i, 'field_of_study', e.target.value)}
                placeholder="e.g., Computer Science"
                fontSize={{ base: "sm", md: "md" }}
              />
            </Field>

            <Box />

            <Field label="Start Date">
              <Input
                type="date"
                value={edu.start_date ? edu.start_date.split('T')[0] : ''}
                onChange={(e) => updateEducation(i, 'start_date', e.target.value + 'T00:00:00')}
              />
            </Field>

            <Field label="End Date">
              <Input
                type="date"
                value={edu.end_date ? edu.end_date.split('T')[0] : ''}
                onChange={(e) => updateEducation(i, 'end_date', e.target.value + 'T00:00:00')}
              />
            </Field>
          </Grid>
        </Box>
      ))}

      <div ref={educationEndRef} />
    </VStack>
  )

  const renderSkills = () => (
    <VStack gap={4} align="stretch">
      <Field label="Skills">
        <VStack align="stretch" gap={2}>
          <HStack>
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem('skills', newSkill, setNewSkill)
                }
              }}
            />
            <IconButton
              aria-label="Add skill"
              onClick={() => addArrayItem('skills', newSkill, setNewSkill)}
              size={'sm'}
            >
              <LuPlus />
            </IconButton>
          </HStack>
          <Flex gap={2} flexWrap="wrap">
            {(formData.skills || []).map((skill, i) => (
              <HStack
                key={i}
                bg={{ base: "purple.200", _dark: "purple.500" }}
                px={3}
                borderRadius="full"
                fontSize="sm"
              >
                <Text>{skill}</Text>
                <IconButton
                  aria-label="Remove"
                  size="xs"
                  variant="plain"
                  onClick={() => removeArrayItem('skills', i)}
                >
                  <LuX size={14} />
                </IconButton>
              </HStack>
            ))}
          </Flex>
        </VStack>
      </Field>

      <Field label="Interests">
        <VStack align="stretch" gap={2}>
          <HStack>
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem('interests', newInterest, setNewInterest)
                }
              }}
            />
            <IconButton
              aria-label="Add interest"
              onClick={() => addArrayItem('interests', newInterest, setNewInterest)}
              size={'sm'}
            >
              <LuPlus />
            </IconButton>
          </HStack>
          <Flex gap={2} flexWrap="wrap">
            {(formData.interests || []).map((interest: string, i: number) => (
              <HStack
                key={i}
                bg={{ base: "orange.200", _dark: "orange.500" }}
                px={3}
                borderRadius="full"
                fontSize="sm"
              >
                <Text>{interest}</Text>
                <IconButton
                  aria-label="Remove"
                  size="xs"
                  variant="plain"
                  onClick={() => removeArrayItem('interests', i)}
                >
                  <LuX size={14} />
                </IconButton>
              </HStack>
            ))}
          </Flex>
        </VStack>
      </Field>
    </VStack>
  )

  const renderSocial = () => (
    <SocialLinksSelector
      socialLinks={formData.social_links || {}}
      contactDetails={formData.contact_details || {}}
      onChange={(socialLinks, contactDetails) => {
        setFormData({
          ...formData,
          social_links: socialLinks,
          contact_details: contactDetails
        })
      }}
    />
  )

  const renderStepContentById = (id: Step) => {
    switch (id) {
      case 'basic': return renderBasicInfo()
      case 'experience': return renderExperience()
      case 'education': return renderEducation()
      case 'skills': return renderSkills()
      case 'social': return renderSocial()
      default: return null
    }
  }


  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size={{ base: "full", md: "xl" }}>
      <DialogContent border="1px solid" borderColor="fg.subtle">
        <DialogBody maxH={{ base: "100vh", md: "90vh" }} overflowY="auto" px={{ base: 4, md: 6 }} py={4}>
          {/* Steps.Root is controlled via "step" and onStepChange */}
          <Steps.Root
            count={STEPS.length} step={step}
            onStepChange={(e) => updateStep(e.step)}
            orientation="horizontal"
            size="md"
          >
            {/* TOP: icons-only step list */}
            <Steps.List w="full" justifyContent="center" >
              {STEPS.map((s, i) => (
                <Steps.Item key={s.id} index={i}>
                  <Steps.Trigger>
                    <Steps.Indicator _hover={{ cursor: "pointer" }}>
                      <s.icon size={18} />
                    </Steps.Indicator>
                  </Steps.Trigger>
                  <Steps.Separator />
                </Steps.Item>
              ))}
            </Steps.List>

            {/* HEADER: current step title + description (rendered inside Steps.Root so it always matches context) */}
            <VStack w="full" gap={4} align="stretch" mb={4}>
              <Flex justify="space-between" align="start" w="full">
                <Box>
                  <Heading size="xl">{STEPS[step].title}</Heading>
                  <Text fontSize="sm" color="fg.muted" mt={1}>
                    {STEPS[step].description}
                  </Text>
                </Box>

                <HStack gap={4} align="start">
                  <IconButton aria-label="Close" variant="ghost" onClick={onClose} colorPalette="red">
                    <LuX />
                  </IconButton>
                </HStack>
              </Flex>
            </VStack>

            {/* CONTENT: map each step to Steps.Content (only active index shows) */}
            {STEPS.map((s, i) => (
              <Steps.Content key={s.id} index={i}>
                {renderStepContentById(s.id)}
              </Steps.Content>
            ))}
          </Steps.Root>
        </DialogBody>

        <DialogFooter>
          <ButtonGroup w="full" justifyContent="space-between">
            {/* Prev button */}
            <Button variant="outline" onClick={goPrev} disabled={step === 0}>
              <LuArrowLeft />
              Previous
            </Button>

            {/* If last step -> show Save button; otherwise Next */}
            {step === STEPS.length - 1 ? (
              <Button colorPalette="green" onClick={handleSubmit} loading={isSubmitting}>
                Save Profile
              </Button>
            ) : (
              <Button onClick={goNext}>
                Next
                <LuArrowRight />
              </Button>
            )}
          </ButtonGroup>
        </DialogFooter>

      </DialogContent>
    </DialogRoot>
  )
}