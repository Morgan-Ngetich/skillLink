import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  VStack,
  Badge,
  Flex,
} from '@chakra-ui/react';

import { ProjectCard } from './ProjectCard';

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


const categories = ['All', 'Coding', 'Startup', 'Career'];

export default function GoalsProjectsTracker() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filtered = selectedCategory === 'All'
    ? fakeProjects
    : fakeProjects.filter(p => p.category === selectedCategory);

  return (
    <VStack align="start" gap={6} px={4} pt={6} border={'1px solid'} borderRadius={'xl'}>
      {/* Header */}
      <HStack justify="space-between" w="full">
        <Heading size="md">Goals & Projects</Heading>
        <HStack gap={3}>
          <Button size="sm" variant="outline">
            + GitHub
          </Button>
          <Button size="sm" variant="outline">
            + LinkedIn
          </Button>
        </HStack>
      </HStack>

      {/* Category Filters */}
      <HStack gap={3}>
        {categories.map(cat => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? 'solid' : 'outline'}
            border={"1px solid"}
            px={3}
            py={1}
            cursor="pointer"
            borderRadius="md"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </HStack>

      {/* Project Grid */}
      <Box overflowX="auto" w="full" mb={1}>
        <Flex gap={4} flexWrap="nowrap">
          {filtered.map(project => (
            <Box key={project.id} minW="250px" flex="0 0 auto">
              <ProjectCard {...project} />
            </Box>
          ))}
        </Flex>
      </Box>
    </VStack>
  );
}
