import { VStack, Box, HStack, Text, Button, Stack, IconButton, Collapsible } from "@chakra-ui/react";
import { LuFileText, LuVideo, LuFile, LuLink, LuChevronDown } from "react-icons/lu";
import { RiArticleFill } from "react-icons/ri";
import type { PreparationMaterial } from "@/client";
import type { ReactNode } from "react";

const typeIcons: Record<string, { icon: ReactNode; color: string }> = {
  pdf: { icon: <LuFileText />, color: "red.500" },
  video: { icon: <LuVideo />, color: "purple.500" },
  article: { icon: <RiArticleFill />, color: "green.500" },
  link: { icon: <LuLink />, color: "blue.500" },
  other: { icon: <LuFile />, color: "gray.500" },
};

interface PreparationTabProps {
  materials: PreparationMaterial[];
  isFromHeroCard?: boolean;
}

const PreparationTab = ({ materials, isFromHeroCard }: PreparationTabProps) => {
  return (
    <VStack align="stretch" gap={isFromHeroCard ? 3 : 4} pb={4}>
      <Text fontSize="sm" color="fg.muted" mb={2}>
        Review these materials before the session
      </Text>

      {materials.map((material, index) => {
        const typeInfo = typeIcons[material.type || "other"];
        return (
          <Box
            key={index}
            p={isFromHeroCard ? 2 : 4}
            bgGradient="to-b"
            gradientFrom={"bg.subtle"}
            gradientTo={"cardbg"}
            borderBottom={"1px solid"}
            _hover={{ bg: "bg.muted" }}
            rounded="lg"
            borderColor="border.emphasized"
            transition="all 0.2s"
          >
            <HStack gap={1}>
              <IconButton boxSize={8} color={typeInfo.color} variant="plain" p={0}>
                {typeInfo.icon}
              </IconButton>
              <Text fontWeight="semibold" fontSize={{ base: "md", md: "lg" }}>
                {material.title || `Material ${index + 1}`}
              </Text>
            </HStack>

            {material.description && (
              <Collapsible.Root collapsedHeight="50px">
                <Collapsible.Content
                  _closed={{
                    shadow: "inset 0 -12px 12px -12px var(--shadow-color)",
                    shadowColor: "blackAlpha.500",
                  }}
                >
                  <Stack padding="2">
                    <Text fontSize="sm" color="fg.muted" lineHeight="relaxed">
                      {material.description}
                    </Text>
                  </Stack>
                </Collapsible.Content>

                <HStack justifyContent="space-between">
                  {material.url && (
                    <Button
                      size="sm"
                      mt={3}
                      variant="surface"
                      _hover={{ border: "1px solid" }}
                      asChild
                    >
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        View Material
                      </a>
                    </Button>
                  )}

                  <Collapsible.Trigger asChild mt="2">
                    <Button variant="outline" size="xs">
                      <Collapsible.Context>
                        {(api) => (api.open ? "Show Less" : "View More")}
                      </Collapsible.Context>
                      <Collapsible.Indicator
                        transition="transform 0.2s"
                        _open={{ transform: "rotate(180deg)" }}
                      >
                        <LuChevronDown />
                      </Collapsible.Indicator>
                    </Button>
                  </Collapsible.Trigger>
                </HStack>
              </Collapsible.Root>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

export default PreparationTab;