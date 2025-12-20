
import type { Experience } from "@/client"
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
} from "@chakra-ui/react"
import { FiEdit } from "react-icons/fi"


interface ExperienceSection {
  experience: Experience[]
  onEditClick: () => void;
}

const ExperienceSection: React.FC<ExperienceSection> = ({ experience, onEditClick }) => {
  return (
    <VStack align="start" gap={6} w="full" px={{ base: 3, md: "" }}>
      <HStack w="100%" justify={"space-between"}>
        <Text fontWeight="semibold">Experience</Text>

        {onEditClick && (
          <IconButton
            aria-label="Edit profile"
            size="xs"
            variant={"surface"}
            onClick={onEditClick}
          >
            <FiEdit />
          </IconButton>
        )}
      </HStack>

      {experience.map((item, index) => (
        <HStack key={index} align="start" gap={{ base: 3, md: 4 }} w="full">
          {/* Logo */}
          <Image
            src={item.logo ?? "/fallback.jpg"}
            alt={`${item.company} logo`}
            boxSize="40px"
            borderRadius="sm"
            objectFit="cover"
          />

          {/* Content */}
          <Box flex="1">
            <Text fontWeight="medium">{item.position}</Text>
            <Text fontSize="sm" color="fg.muted">{item.company}</Text>
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

            <Text fontSize="sm" mt={2} color="fg.muted">
              {item.description}
            </Text>
          </Box>
        </HStack>
      ))}

    </VStack>
  )
}

export default ExperienceSection;