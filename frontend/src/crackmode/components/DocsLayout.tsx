import {
  Box,
  Container,
  Flex,
  IconButton,
  Drawer,
  Portal,
} from "@chakra-ui/react"
import { IoMenu } from "react-icons/io5"
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
    <Flex h="100vh" overflow="hidden">
      {/* Mobile Menu Button */}
      <Drawer.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        placement="start"
      >
        <Drawer.Trigger asChild>
          <IconButton
            aria-label="Open menu"
            display={{ base: "flex", md: "none" }}
            position="fixed"
            top={4}
            right={4}
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


      {/* Main Content (scrollable) */}
      <Box flex="1" h="100vh" overflowY="auto">
        <Container maxW="4xl" py={8} px={{ base: 4, md: 8 }}>
          <Box>{children}</Box>
        </Container>
      </Box>

      {/* Desktop TOC */}
      <Box
        as="aside"
        w="300px"
        borderLeft="1px"
        borderColor={borderColor}
        py={6}
        display={{ base: "none", lg: "block" }}
        position="sticky"
        top={0}
        h="100vh"
        overflowY="auto"
      >
        <TableOfContents headings={headings} />
      </Box>
    </Flex>
  )
}

export default DocsLayout
