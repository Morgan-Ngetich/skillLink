import {
  Box,
  Text,
  VStack,
  Icon,
  Flex,
  Tabs,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"
import {
  LuTarget,
  LuFileText,
  LuCheck,
  LuCompass,
  LuHeart,
  LuSmartphone,
} from "react-icons/lu"
import { Progress, useColorModeValue } from "@/components/ui"
import GoalsProjectsTracker from "./GoalsProjectsTracker/Index"
import { ProjectCard } from "./GoalsProjectsTracker/ProjectCard";

const fakeProjects = [
  {
    id: 1,
    title: '500 LeetCode Questions',
    category: 'Coding',
    task: 'Solve 200 Easy',
    progress: 60,
    deadline: '2025-08-30',
    url: 'https://leetcode.com/problemset/all/',
    todayFocus: true,
    mentors: [
      { name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', avatar: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
  {
    id: 2,
    title: 'Startup MVP - Braidify',
    category: 'Startup',
    task: 'Finalize Pricing Engine',
    progress: 45,
    deadline: '2025-08-10',
    url: 'https://github.com/braidify/mvp-core',
    todayFocus: false,
    mentors: [
      { name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', avatar: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
  {
    id: 3,
    title: 'DSA Class Site',
    category: 'Career',
    task: 'Wireframe Curriculum',
    progress: 80,
    deadline: '2025-08-05',
    url: 'https://figma.com/file/example-dsa-design',
    todayFocus: false,
    mentors: [
      { name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', avatar: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
  {
    id: 4,
    title: 'DSA Class Site',
    category: 'Career',
    task: 'Wireframe Curriculum',
    progress: 80,
    deadline: '2025-08-05',
    url: 'https://figma.com/file/example-dsa-design',
    todayFocus: true,
    mentors: [
      { name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
      { name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
      { name: 'Carol', avatar: 'https://i.pravatar.cc/40?img=3' },
    ],
  },
];

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

export default function GoalsAndInterestsTabs() {
  const selectedBg = useColorModeValue("gray.200", "gray.700")

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
            {fakeProjects.map((project, index) => (
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
