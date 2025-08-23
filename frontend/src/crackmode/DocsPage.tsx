import { Flex, Box } from "@chakra-ui/react"
import Sidebar from "@/crackmode/components/Sidebar"
import TableOfContents from "@/crackmode/components/TableOfContents"
import IntroDoc from "@/crackmode/docs/introduction.mdx"
import { useHeadings } from "@/crackmode/hooks/useHeading"

const DocsPage = () => {
  const headings = useHeadings()

  return (
    <Flex w="100%" minH="100vh">
      {/* Sidebar - hide on mobile */}
      <Box
        as="aside"
        display={{ base: "none", md: "block" }}
        w={{ md: "64", lg: "72" }}
        flexShrink={0}
        borderRight="1px solid"
        borderColor="gray.200"
        p={4}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box flex="1" px={{ base: 4, md: 8 }} py={6} maxW="800px" mx="auto">
        {/* <MDXProvider components={MDXComponents}> */}
          <IntroDoc />
        {/* </MDXProvider> */}
      </Box>

      {/* Table of Contents - hide on mobile/tablet */}
      <Box
        as="aside"
        display={{ base: "none", xl: "block" }}
        w="300px"
        flexShrink={0}
        // borderLeft="1px solid"
        borderColor="gray.200"
        p={4}
        position="sticky"
        top="4rem"
        h="calc(100vh - 4rem)"
        overflowY="auto"
      >
        <TableOfContents headings={headings} />
      </Box>
    </Flex>
  )
}

export default DocsPage