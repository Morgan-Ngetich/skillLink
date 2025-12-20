import {
  Box,
  Text,
  Wrap,
  WrapItem,
  HStack,
  IconButton
} from "@chakra-ui/react"
import { FiEdit } from "react-icons/fi"

interface SkillsSectionProps {
  skillsOrinterests?: string[]
  section: "skillsSection" | "interestSection"
  onEditClick: () => void;
}

export default function SkillsOrInterests({ skillsOrinterests, section, onEditClick }: SkillsSectionProps) {
  const bg = { base: 'gray.200', _dark: 'gray.700' }

  if (!skillsOrinterests?.length) return null
  const title = section === "skillsSection" ? "Skills" : "Interests"

  return (
    <Box px={{ base: 3, md: "" }}>
      <HStack w="100%" justify={"space-between"}>
        <Text fontWeight="semibold" fontSize="md" mb={3}>
          {title}
        </Text>

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

      <Wrap gap={3}>
        {skillsOrinterests.map((item) => (
          <WrapItem key={item}>
            <Box
              px={{ base: 1.5, lg: 3 }}
              py={{ base: 1.5, lg: 2 }}
              fontSize="sm"
              borderRadius="lg"
              border="1px solid"
              bg={bg}
              transition="all 0.2s"
              textAlign="center"
            >
              {item}
            </Box>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}
