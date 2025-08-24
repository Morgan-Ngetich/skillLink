import { useEffect } from "react"
import {
  VStack,
  Link,
  Text,
  Flex,
  Icon,
  Collapsible,
  Box
} from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui"
import { useRouter } from "@tanstack/react-router"
import { sidebarConfig } from "../config/sidebarConfig"
import { RiMenuFold4Line, RiMenuUnfold4Line } from "react-icons/ri";
import { useSidebarStore } from "../hooks/stores/sidebarStore"

const Sidebar = () => {
  const router = useRouter()
  const {
    expandedSections,
    expandedLinks,
    setExpandedSections,
    toggleSection,
    toggleLink,
  } = useSidebarStore()

  // Initialize expanded sections based on current route (only on first load)
  useEffect(() => {
    const hasInitializedSections = Object.keys(expandedSections).length > 0
    
    if (!hasInitializedSections) {
      const initialExpanded: Record<string, boolean> = {}
      sidebarConfig.forEach((section) => {
        const hasCurrentPage = section.links.some(link =>
          router.basepath.startsWith(link.href)
        )
        initialExpanded[section.title] = hasCurrentPage
      })
      setExpandedSections(initialExpanded)
    }
  }, [router.basepath, expandedSections, setExpandedSections])

  const linkHoverBg = useColorModeValue("gray.100", "gray.700")
  const activeLinkBg = useColorModeValue("blue.50", "blue.900")
  const activeLinkColor = useColorModeValue("blue.600", "blue.200")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Box
      as="nav"
      w="280px"
      borderRight="1px solid"
      borderColor={borderColor}
      pl={6}
      pt={8}
      display={{ base: "none", md: "block" }}
      position="sticky"
      top={0}
      h="100vh"
      overflowY="auto"
    >
      <VStack align="stretch" gap={1}>
        {sidebarConfig.map((section) => (
          <Collapsible.Root
            key={section.title}
            open={expandedSections[section.title]}
            onOpenChange={() => toggleSection(section.title)}
          >
            {/* Section Header */}
            <Collapsible.Trigger asChild>
              <Flex
                align="center"
                justify="space-between"
                py={2}
                px={3}
                cursor="pointer"
                _hover={{ bg: linkHoverBg }}
                borderRadius="md"
              >
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {section.title}
                </Text>
                <Icon
                  as={expandedSections[section.title] ? RiMenuFold4Line : RiMenuUnfold4Line}
                  w={4}
                  h={4}
                  color="gray.400"
                />
              </Flex>
            </Collapsible.Trigger>

            {/* Collapsible Links */}
            <Collapsible.Content>
              <VStack align="stretch" gap={1} px={4} py={2}>
                {section.links.map((link) => {
                  const isActive = router.basepath === link.href;
                  const isLinkExpanded = expandedLinks[link.title];

                  return (
                    <VStack align="start" key={link.href} gap={0}>
                      {/* Main link with toggle */}
                      <Flex
                        justify="space-between"
                        w="100%"
                        py={2}
                        px={3}
                        borderRadius="md"
                        fontSize="sm"
                        color={isActive ? activeLinkColor : "inherit"}
                        bg={isActive ? activeLinkBg : "transparent"}
                        cursor={link.children ? "pointer" : "default"}
                        _hover={{ bg: linkHoverBg }}
                        fontWeight={isActive ? "medium" : "normal"}
                        onClick={() => link.children && toggleLink(link.title)}
                      >
                        <Link
                          href={link.href}
                          lineClamp={1}
                          onClick={(e) => link.children && e.preventDefault()} // prevent navigating if has children
                        >
                          {link.title}
                        </Link>

                        {link.children && (
                          <Icon
                            as={isLinkExpanded ? RiMenuFold4Line : RiMenuUnfold4Line}
                            w={4}
                            h={4}
                            color="gray.400"
                          />
                        )}
                      </Flex>

                      {/* Nested links (collapsible) */}
                      {link.children && isLinkExpanded && (
                        <VStack pl={4} mt={1} align="start" gap={0}>
                          {link.children.map((child) => {
                            const isChildActive = router.basepath === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                py={1}
                                px={3}
                                borderRadius="md"
                                fontSize="sm"
                                color={isChildActive ? activeLinkColor : "fg.muted"}
                                bg={isChildActive ? activeLinkBg : "transparent"}
                                _hover={{
                                  bg: isChildActive ? activeLinkBg : linkHoverBg,
                                  textDecoration: "none",
                                }}
                                fontWeight={isChildActive ? "medium" : "normal"}
                                lineClamp={1}
                              >
                                {child.title}
                              </Link>
                            );
                          })}
                        </VStack>
                      )}
                    </VStack>
                  );
                })}

              </VStack>

            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </VStack>
    </Box>
  )
}

export default Sidebar
