import {
  Box,
  Text,
  VStack,
  Flex,
  Tabs,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"
import {
  LuCheck,
  LuCompass,
  LuHeart,
  LuSmartphone,
} from "react-icons/lu"
import { useColorModeValue } from "@/components/ui"
// import GoalsProjectsTracker from "../GoalsProjectsTracker/Index"
import { ProjectCard } from "../GoalsProjectsTracker/ProjectCard";
import { fakeProjects } from "@/client/services/ment";


const GoalsAndInterestsTabs = () => {
  const selectedBg = useColorModeValue("gray.200", "gray.700")
  const userInterests = [
    {
      summary: "Inclusive Design and Accessibility",
      icon: LuHeart,
    },
    {
      summary: "UX Research and User Interviews",
      icon: LuCompass,
    },
    {
      summary: "Designing Mobile Experiences",
      icon: LuSmartphone,
    },
  ]

  return (
    <Tabs.Root defaultValue="goals" variant="plain" w="full">
      <Tabs.List bg="bg.emphasized" rounded="l3" p={1}>
        <Tabs.Trigger value="goals">
          <LuCheck />
          Goals
        </Tabs.Trigger>
        <Tabs.Trigger value="interests">
          <LuHeart />
          Interests
        </Tabs.Trigger>
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
      <Tabs.Content
        value="goals"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box overflowX="auto" w="full">
          <Flex gap={4} flexWrap="nowrap">
            {fakeProjects.map((project) => (
              <Box key={project.id} minW="250px" flex="0 0 auto">
                <ProjectCard {...project} />
              </Box>
            ))}
          </Flex>
        </Box>
      </Tabs.Content>


      <Tabs.Content value="interests">
        <VStack align="start" gap={4} w="full" pt={4}>
          <Wrap gap={3}>
            {userInterests.map(({ summary }, index) => (
              <WrapItem key={index}>
                <Box
                  as="button"
                  border="1px solid"
                  borderRadius="2xl"
                  p={3}
                  bg={selectedBg}
                  transition="all 0.3s"
                >
                  <Text fontSize="sm">{summary}</Text>
                </Box>
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      </Tabs.Content>
    </Tabs.Root>
  )
}


export default GoalsAndInterestsTabs