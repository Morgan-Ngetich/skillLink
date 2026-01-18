import { Container, Flex, Box, Spinner, useBreakpointValue } from "@chakra-ui/react"
import DesktopSidebarLoadingState from "./DesktopSidebarLoadingState"
import ProfilePageLoadingState from "@/components/profile/profilePage/loadingSkeletons/ProfilePageLoadingState"

const ProfilePageSkeleton = () => {
  const isMobile = useBreakpointValue({ base: true, md: false})
  
  return (
    <Container h="full" p={{ base: 2, md: 5 }} maxW="breakpoint-xl">
      <Flex justify="space-between" gap={5} direction={{ base: "column", md: "row" }}>
        <Box flex={{ base: "none", lg: "0 0 60%" }} w={{ base: "100%", lg: "60%" }}>
          <ProfilePageLoadingState />
        </Box>

        {isMobile ? (
          <Flex justify="center" align="center" h="30vh" bg={"bg"} borderRadius={"xl"}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <DesktopSidebarLoadingState />
        )}
      </Flex>
    </Container>
  )
}

export default ProfilePageSkeleton