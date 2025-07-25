import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
} from "@chakra-ui/react"

interface EducationItem {
  schoolLogo: string
  schoolName: string
  degree: string
  duration: string
  description?: string
}

const educationItems: EducationItem[] = [
  {
    schoolLogo: "https://picsum.photos/seed/jkuat/40",
    schoolName: "Jomo Kenyatta University of Agriculture and Technology (JKUAT)",
    degree: "BSc in Information Technology",
    duration: "2020 – 2024",
    description: "Focused on software development, user-centered design, and systems analysis.",
  },
  {
    schoolLogo: "https://picsum.photos/seed/udemy/40",
    schoolName: "Udemy / Self-paced",
    degree: "Certificate in UX/UI Design",
    duration: "2022",
    description: "Completed a 40-hour course covering Figma, wireframing, and user research fundamentals.",
  },
]

export default function EducationSection() {
  return (
    <VStack align="start" gap={6} w="full">
      <Text fontWeight="semibold" fontSize="md">Education</Text>

      {educationItems.map((item, index) => (
        <HStack key={index} align="start" gap={4} w="full">
          {/* Logo */}
          <Image
            src={item.schoolLogo}
            alt={`${item.schoolName} logo`}
            boxSize="40px"
            borderRadius="md"
            objectFit="cover"
          />

          {/* Content */}
          <Box flex="1">
            <Text fontWeight="medium">{item.degree}</Text>
            <Text fontSize="sm" color="fg.muted">{item.schoolName}</Text>
            <Text fontSize="sm" color="fg.muted">{item.duration}</Text>
            {item.description && (
              <Text fontSize="sm" mt={2} color="fg.muted">
                {item.description}
              </Text>
            )}
          </Box>
        </HStack>
      ))}
    </VStack>
  )
}
