import type { Education } from "@/client"
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
} from "@chakra-ui/react"

interface EducationSectionProps {
  education: Education[]
}

const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
  return (
    <VStack align="start" gap={6} w="full" px={{ base: 3, md: "" }}>
      <Text fontWeight="semibold" fontSize="md">Education</Text>

      {education.map((item, index) => (
        <HStack key={index} align="start" gap={4} w="full">
          {/* Logo */}
          <Image
            src={item.logo}
            alt={`${item.institution} logo`}
            boxSize="40px"
            borderRadius="md"
            objectFit="cover"
          />

          {/* Content */}
          <Box flex="1">
            <Text fontWeight="medium">{item.degree}</Text>
            <Text fontSize="sm" color="fg.muted">{item.institution}</Text>
            <HStack fontSize="sm" color="fg.muted">
              <Text>
                {item.start_date ? new Date(item.start_date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                }) : ""}
                {" – "}
                {item.end_date
                  ? new Date(item.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                  : "Present"}
              </Text>
            </HStack>
          </Box>
        </HStack>
      ))}
    </VStack>
  )
}


export default EducationSection;