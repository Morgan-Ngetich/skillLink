import {
  Box,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"

interface SkillsSectionProps {
  goals?: string[]
}

export default function SkillsOrInterests({ goals }: SkillsSectionProps) {
  const bg = { base: 'green.200', _dark: 'green.700' }

  if (!goals?.length) return null

  return (
    <Box px={{ base: 3, md: "" }}>
      <Text fontWeight="semibold" fontSize="md" mb={3}>
        Goals
      </Text>

      <Wrap gap={3}>
        {goals.map((item) => (
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
