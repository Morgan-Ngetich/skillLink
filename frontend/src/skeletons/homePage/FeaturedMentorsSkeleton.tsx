import { HStack, Flex,  } from "@chakra-ui/react"
import { MentorCardSkeleton } from "./MentorCardSkeleton"

const FeaturedMentorsSkeleton = () => {
  return (
    <>
      {/* Mobile skeleton - horizontal scroll */}
      <HStack
        display={{ base: "flex", md: "none" }}
        direction="row"
        w="100vw"
        overflowX="auto"
        pr={4}
        gap={2}
      >
        {[1, 2, 3].map((i) => (
          <MentorCardSkeleton key={i} />
        ))}
      </HStack>

      {/* Desktop skeleton - wrapped grid */}
      <Flex
        display={{ base: "none", md: "flex" }}
        wrap="wrap"
        gap={2}
      >
        {[1, 2, 3].map((i) => (
          <MentorCardSkeleton key={i} />
        ))}
      </Flex>
    </>
  )
}

export default FeaturedMentorsSkeleton