import { useState, useRef, useEffect } from "react"
import {
  Box,
  Container,
  Flex,
} from "@chakra-ui/react"
import TableOfContents from "./TableOfContents"
import type { HeadingData } from "../types/docs"
import { BreadcrumbRoot, BreadcrumbLink, BreadcrumbCurrentLink } from "@/components/ui"
import { useBreadcrumbItems } from "../hooks/useBreadcrumbItems"

interface DocsLayoutProps {
  children: React.ReactNode
  headings: HeadingData[]
}

const DocsLayout = ({ children, headings }: DocsLayoutProps) => {
  const [scrolled, setScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Get breadcrumbs with structured data
  const { displayItems } = useBreadcrumbItems()

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrolled(scrollRef.current.scrollTop > 0)
    }
  }

  useEffect(() => {
    const current = scrollRef.current
    if (current) {
      current.addEventListener("scroll", handleScroll)
      return () => current.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const borderColor = { base: 'gray.200', _dark: 'gray.700' }


  return (
    <Flex h="100vh" overflow="hidden">
      {/* Main Content (scrollable) */}
      <Box flex="1" h="100vh" overflowY="auto" ref={scrollRef}>
        <Container maxW="4xl" pt={4} pb={8} px={{ base: 4, md: 8 }}>
          {displayItems && displayItems.length > 0 && (
            <Box
              mb={{ base: 1, md: 6 }}
              position="sticky"
              top={0}
              zIndex="5"
              bg={scrolled ? { base: 'white', _dark: 'gray.900' } : 'transparent'}
              pb={2}
              pt={{ base: 1, md: 2 }}
              w="full"
              overflowX={"auto"}
              whiteSpace={"nowrap"}
              scrollbar={"hidden"}
            >
              <BreadcrumbRoot separator="/" separatorGap={2}>
                {displayItems.map((item, index) => {
                  const isLast = index === displayItems.length - 1

                  return isLast ? (
                    <BreadcrumbCurrentLink key={index}>
                      {item.title}
                    </BreadcrumbCurrentLink>
                  ) : (
                    <BreadcrumbLink key={index} href={item.url}>
                      {item.title}
                    </BreadcrumbLink>
                  )
                })}
              </BreadcrumbRoot>
            </Box>
          )}

          {/* Content */}
          <Box pb={16}>{children}</Box>
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