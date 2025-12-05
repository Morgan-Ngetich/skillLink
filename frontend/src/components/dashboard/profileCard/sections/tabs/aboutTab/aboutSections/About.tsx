import { VStack, Text, Box, Button } from "@chakra-ui/react"
import { useState, useEffect, useRef } from "react"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"

interface AboutProps {
  about: string
  maxLines?: number
}

const About: React.FC<AboutProps> = ({ about, maxLines = 5 }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current
      setIsOverflowing(el.scrollHeight > el.clientHeight + 5)
    }
  }, [about, maxLines])

  return (
    <VStack align="start" w="full" px={{ base: 3, md: 4 }} gap={3}>
      <Text fontWeight="semibold" color="fg.emphasized">
        About
      </Text>

      <Box position="relative" w="full">
        <Box
          ref={textRef}
          fontSize="sm"
          color="fg.muted"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            WebkitLineClamp: isExpanded ? "unset" : String(maxLines),
            transition: "all 0.3s ease",
            whiteSpace: "pre-wrap",
          }}
        >
          {about}
        </Box>

        {!isExpanded && isOverflowing && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            h="30px"
            bgGradient="linear(to-t, var(--chakra-colors-bg-muted), transparent)"
          />
        )}
      </Box>

      {isOverflowing && (
        <Button
          variant="ghost"
          size="2xs"
          colorPalette="teal"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {isExpanded ? (
            <>
              <FiChevronUp />
              Show Less
            </>
          ) : (
            <>
              <FiChevronDown />
              See More
            </>
          )}
        </Button>
      )}
    </VStack>
  )
}

export default About
