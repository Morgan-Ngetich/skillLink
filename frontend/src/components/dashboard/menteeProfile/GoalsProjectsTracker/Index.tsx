import { useState } from "react";
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
import { fakeProjects } from "@/client/services/ment";




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
