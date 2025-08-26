import {
  VStack,
  Text,
  Box,
  Link
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useColorModeValue } from "@/components/ui"
import type { HeadingData } from "../types/docs"

interface TableOfContentsProps {
  headings: HeadingData[]
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>("")
  const linkColor = useColorModeValue("gray.600", "gray.400")
  const activeLinkColor = useColorModeValue("teal.600", "teal.200")

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0% -80% 0%" }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <Box borderLeft="1px solid" borderColor="gray.200" pl={4} pr={2} pb={16}>
      <Text
        fontWeight="semibold"
        fontSize="sm"
        textTransform="uppercase"
        letterSpacing="wide"
        mb={4}
      >
        On This Page
      </Text>
      <VStack align={"stretch"} gap={0}>
        {headings.map((heading) => (
          <Link
            key={heading.id}
            href={`#${heading.id}`}
            py={1}
            px={2}
            ml={(heading.level - 2) * 4}
            borderRadius="md"
            fontSize={"14px"}
            color={activeId === heading.id ? activeLinkColor : linkColor}
            fontWeight={activeId === heading.id ? "medium" : "normal"}
            aria-current={activeId === heading.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById(heading.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
                // update the URL hash
                window.history.pushState(null, "", `#${heading.id}`);
            }}
            _hover={{
              color: activeLinkColor,
              textDecoration: "none"
            }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: activeLinkColor,
              outlineOffset: "2px"
            }}
            lineClamp={1}
          >
            {heading.text}
          </Link>
        ))}
      </VStack>
    </Box>
  )
}

export default TableOfContents