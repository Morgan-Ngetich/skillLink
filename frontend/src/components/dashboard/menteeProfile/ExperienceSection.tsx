import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
} from "@chakra-ui/react"

interface ExperienceItem {
  companyLogo: string
  companyName: string
  role: string
  duration: string
  description: string
}

const experienceItems: ExperienceItem[] = [
  {
    companyLogo: "https://picsum.photos/seed/google/40",
    companyName: "Google",
    role: "UX Design Intern",
    duration: "Jun 2024 – Aug 2024",
    description: "Worked on improving mobile user flows for Google Maps, contributing to UI accessibility and performance enhancements.",
  },
  {
    companyLogo: "https://picsum.photos/seed/startup/40",
    companyName: "Brightly Labs",
    role: "Junior Product Designer",
    duration: "Jan 2023 – May 2024",
    description: "Designed wireframes and prototypes for an ed-tech platform. Collaborated with devs and product managers on agile teams.",
  },
  {
    companyLogo: "https://picsum.photos/seed/freelance/40",
    companyName: "Freelance",
    role: "Freelance UI/UX Designer",
    duration: "2021 – Present",
    description: "Delivered branding and website UI design to over 10 small businesses and startups.",
  },
]

export default function ExperienceSection() {
  return (
    <VStack align="start" gap={6} w="full">
      <Text fontWeight="semibold">Experience</Text>

      {experienceItems.map((item, index) => (
        <HStack key={index} align="start" gap={4} w="full">
          {/* Logo */}
          <Image
            src={item.companyLogo}
            alt={`${item.companyName} logo`}
            boxSize="40px"
            borderRadius="sm"
            objectFit="cover"
          />

          {/* Content */}
          <Box flex="1">            
            <Text fontWeight="medium">{item.role}</Text>
            <Text fontSize="sm" color="fg.muted">{item.companyName}</Text>
            <Text fontSize="sm" color="fg.muted">{item.duration}</Text>
            <Text fontSize="sm" mt={2} color="fg.muted">
              {item.description}
            </Text>
          </Box>
        </HStack>
      ))}

    </VStack>
  )
}
