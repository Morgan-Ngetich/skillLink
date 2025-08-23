import {
  HStack,
  Text,
  Badge,
} from "@chakra-ui/react"

export const ThemeItem = ({
  label,
  color,
  desc,
}: {
  label: string
  color: string
  desc: string
}) => (
  <HStack p={3} borderRadius="md" gap={3} border="1px solid">
    <Badge colorPalette={color} variant="surface">
      {label}
    </Badge>
    <Text fontSize="sm">{desc}</Text>
  </HStack>
)