"use client"

import {
  Box,
  Container,
  Flex,
  IconButton,
  Drawer,
  Portal,
} from "@chakra-ui/react"
import { IoMenu } from "react-icons/io5";
import { useState } from "react"
import Sidebar from "./Sidebar"
import TableOfContents from "./TableOfContents"
import type { HeadingData } from "../types/docs"
import { useColorModeValue } from "@/components/ui"

interface DocsLayoutProps {
  children: React.ReactNode
  headings: HeadingData[]
}

const DocsLayout = ({ children, headings }: DocsLayoutProps) => {
  const [open, setOpen] = useState(false)
  const borderColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Box minH="100vh">
      <Flex>
        {/* Mobile Menu Button */}
        <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement="start">
          <Drawer.Trigger asChild>
            <IconButton
              aria-label="Open menu"
              display={{ base: "flex", md: "none" }}
              position="fixed"
              top={4}
              left={4}
              zIndex={20}
              size="sm"
            >
              <IoMenu />
            </IconButton>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Menu</Drawer.Title>
                  <Drawer.CloseTrigger />
                </Drawer.Header>
                <Drawer.Body pt={4}>
                  <Sidebar />
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>

        {/* Desktop Sidebar */}
        <Box
          as="nav"
          w="280px"
          minH="100vh"
          borderRight="1px"
          borderColor={borderColor}
          p={6}
          display={{ base: "none", md: "block" }}
          position="sticky"
          top={0}
          overflowY="auto"
        >
          <Sidebar />
        </Box>

        {/* Main Content */}
        <Box flex="1" minH="100vh">
          <Container maxW="4xl" py={8} px={{ base: 4, md: 8 }}>
            <Box
              maxW="none"
              css={({
                "& h1": {
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                  marginTop: 0,
                },
                "& h2": {
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  marginTop: "2rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid",
                  borderColor: borderColor,
                },
                "& h3": {
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  marginTop: "1.5rem",
                },
                "& h4": {
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  marginTop: "1rem",
                },
                "& p": {
                  marginBottom: "1rem",
                  lineHeight: 1.75,
                },
                "& ul, & ol": {
                  marginBottom: "1rem",
                  paddingLeft: "1.5rem",
                },
                "& li": {
                  marginBottom: "0.5rem",
                },
                "& pre": {
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: "0.375rem",
                  overflow: "auto",
                },
                "& code": {
                  fontSize: "0.875rem",
                  padding: "0.125rem 0.25rem",
                  borderRadius: "0.25rem",
                  background: useColorModeValue("gray.100", "gray.700"),
                },
                "& pre code": {
                  padding: 0,
                  background: "transparent",
                },
                "& blockquote": {
                  borderLeft: "4px solid",
                  borderColor: "blue.500",
                  paddingLeft: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem",
                  background: useColorModeValue("blue.50", "blue.900"),
                  borderRadius: "0.375rem",
                },
              })}
            >
              {children}
            </Box>
          </Container>
        </Box>

        {/* Desktop Table of Contents */}
        <Box
          as="aside"
          w="250px"
          minH="100vh"
          borderLeft="1px"
          borderColor={borderColor}
          p={6}
          display={{ base: "none", lg: "block" }}
          position="sticky"
          top={0}
          overflowY="auto"
        >
          <TableOfContents headings={headings} />
        </Box>
      </Flex>
    </Box>
  )
}

export default DocsLayout
