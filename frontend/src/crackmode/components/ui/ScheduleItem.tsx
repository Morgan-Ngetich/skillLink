import { HStack, VStack, Text, Icon } from "@chakra-ui/react"
import type { ComponentProps } from "react"

export const ScheduleItem = ({
  icon,
  color,
  title,
  desc,
}: {
  icon: ComponentProps<typeof Icon>["as"]
  color: string
  title: string
  desc: string
}) => (
  <HStack
    bg="cardbg"
    borderLeft="4px solid"
    borderLeftColor={color}
    p={3}
    borderRadius="md"
    gap={3}
  >
    <Icon as={icon} boxSize={5} color={color} />
    <VStack align="start" gap={0}>
      <Text fontSize="sm" fontWeight="bold">{title}</Text>
      <Text fontSize="xs" color="fg.muted">{desc}</Text>
    </VStack>
  </HStack>
)
