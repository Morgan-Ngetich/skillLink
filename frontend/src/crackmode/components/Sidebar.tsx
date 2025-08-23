import { useState } from "react"
import {
  VStack,
  Link,
  Text,
  Flex,
  Icon,
  Collapsible,
} from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui"
import { useRouter } from "@tanstack/react-router"
import { sidebarConfig } from "../config/sidebarConfig"
import { RiMenuFold4Line, RiMenuUnfold4Line  } from "react-icons/ri";

const Sidebar = () => {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {}
    sidebarConfig.forEach((section) => {
      const hasCurrentPage = section.links.some(link =>
        router.basepath.startsWith(link.href)
      )
      initialExpanded[section.title] = hasCurrentPage
    })
    return initialExpanded
  })

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }))
  }

  const linkHoverBg = useColorModeValue("gray.100", "gray.700")
  const activeLinkBg = useColorModeValue("blue.50", "blue.900")
  const activeLinkColor = useColorModeValue("blue.600", "blue.200")

  return (
    <VStack align="stretch" gap={1} >
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
                color="gray.500"
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
            <VStack align="stretch" gap={1} pl={4} pb={2}>
              {section.links.map((link) => {
                const isActive = router.basepath === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    py={2}
                    px={3}
                    borderRadius="md"
                    fontSize="sm"
                    color={isActive ? activeLinkColor : "inherit"}
                    bg={isActive ? activeLinkBg : "transparent"}
                    _hover={{
                      bg: isActive ? activeLinkBg : linkHoverBg,
                      textDecoration: "none",
                    }}
                    fontWeight={isActive ? "medium" : "normal"}
                  >
                    {link.title}
                  </Link>
                )
              })}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      ))}
    </VStack>
  )
}

export default Sidebar
