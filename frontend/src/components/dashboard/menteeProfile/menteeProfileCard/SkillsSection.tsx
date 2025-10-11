import {
  Box,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"

interface SkillsSectionProps {
  skills: string[]
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const bg = { base: 'gray.200', _dark: 'gray.700' }      

  if (!skills?.length) return null

  return (
    <Box>
      <Text fontWeight="semibold" fontSize="md" mb={3}>
        Skills
      </Text>

      <Wrap gap={3}>
        {skills.map((skill) => (
          <WrapItem key={skill}>
            <Box
              px={{base: 2, lg: 3}}
              py={{base: 2}}
              fontSize="sm"
              borderRadius="lg"
              border="1px solid"
              bg={bg}
              transition="all 0.2s"
              as="button"
              textAlign="center"
            >
              {skill}
            </Box>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}
