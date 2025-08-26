import {
  Badge,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Card,
  Link,
  CloseButton,
} from "@chakra-ui/react"
import { IoTimeSharp } from "react-icons/io5";
import { SiLeetcode } from "react-icons/si";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  useColorModeValue,
} from "@/components/ui"
import type { LeetcodeProblem } from "@/crackmode/types/calendar"
import { LuExternalLink } from "react-icons/lu";

interface ProblemDetailsProps {
  isOpen: boolean
  date: string
  problems: LeetcodeProblem[]
  onClose: () => void
}

export function ProblemDetails({ isOpen, date, problems, onClose }: ProblemDetailsProps) {
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDifficultyColorScheme = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "green"
      case "Medium":
        return "yellow"
      case "Hard":
        return "red"
      default:
        return "gray"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()} placement={'center'}>
      <DialogContent maxW="2xl" border="1px solid">
        <DialogHeader>
          <VStack align="start" gap={1}>
            <Text fontSize={{base: "lg", md: "xl"}}>Problems for {formatDate(date)}</Text>
            <Text fontSize="sm" color={'fg.muted'}>
              {problems.length} problem{problems.length !== 1 ? "s" : ""} tracked
            </Text>
          </VStack>
        </DialogHeader>

        <DialogCloseTrigger asChild >
          <CloseButton onClick={onClose} variant={'surface'}/>
        </DialogCloseTrigger>

        <DialogBody maxH={"md"} overflowY={"auto"}>
          <VStack gap={4}>
            {problems.map((problem) => (
              <Card.Root
                key={problem.id}
                w="full"
                bg={'cardbg'}
                borderColor={borderColor}
                borderWidth="1px"
              >
                <Card.Body p={4}>
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Flex direction={{ base: "column", md: "row" }} align="start" gap={3} flex={1}>
                      <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" lineClamp={1}>
                        {problem.title}
                      </Text>
                      <HStack gap={1}>
                        <Badge
                          colorPalette={getDifficultyColorScheme(problem.difficulty)}
                          variant="surface"
                          fontSize="xs"
                        >
                          {problem.difficulty}
                        </Badge>
                        {problem.solved && (
                          <Badge colorPalette="blue" fontSize="xs" variant={"surface"}>
                            ✓ Solved
                          </Badge>
                        )}
                      </HStack>
                    </Flex>
                    <Link
                      href={problem.url}
                      target="_blank"
                      color="fg.inverted"
                    >
                      <Button
                        rel="noopener noreferrer"
                        size={{ base: "xs", md: "sm" }}
                        ml={4}
                        _hover={{ border: "1px solid", }}
                        variant={"surface"}
                        border="1px solid"
                        borderColor={"fg.muted"}
                      >
                        <SiLeetcode color="orange" />
                        Leetcode
                      </Button>
                    </Link>
                  </Flex>

                  <Flex wrap="wrap" gap={1} mb={3}>
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="surface" colorPalette="purple" fontSize="xs">
                        {tag}
                      </Badge>
                    ))}
                  </Flex>

                  <Flex justify={'space-between'}>
                    {problem.solved && problem.solvedAt && (
                      <HStack gap={1} fontSize="sm" color={'fg.muted'}>
                        <IoTimeSharp />
                        <Text>Solved at {formatTime(problem.solvedAt)}</Text>
                      </HStack>
                    )}
                    <Link
                      href={problem.url}
                      target="_blank"
                      color="fg.inverted"
                    >
                      <Button
                        rel="noopener noreferrer"
                        size={{ base: "xs", md: "sm" }}
                        ml={4}
                        _hover={{ border: "1px solid", }}
                        border="1px solid"
                        borderColor={"fg.muted"}
                      >
                        <LuExternalLink />
                        Docs
                      </Button>
                    </Link>
                  </Flex>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot >
  )
}
