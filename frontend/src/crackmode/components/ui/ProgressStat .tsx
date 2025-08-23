import {
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react"
import { Progress } from "@/components/ui"

export const ProgressStat = ({
  label,
  value,
  count,
  color,
}: {
  label: string
  value: number
  count: string
  color: string
}) => (
  <VStack align="stretch" gap={1}>
    <HStack justify="space-between">
      <Text fontSize="sm">{label}</Text>
      <Text fontSize="sm" color={`${color}.500`}>
        {count}
      </Text>
    </HStack>
    <Progress value={value} bg={`${color}.400`} />
  </VStack>
)
