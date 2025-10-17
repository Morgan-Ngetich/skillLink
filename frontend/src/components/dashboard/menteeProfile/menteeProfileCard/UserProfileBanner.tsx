import { Box, Image, IconButton, HStack, Flex } from "@chakra-ui/react"
import { Avatar, Tag } from "@/components/ui"
import { FiEdit } from "react-icons/fi"
import MenteeHeaderProfileSection from "./MenteeHeaderProfileSection";
import type { UserProfilePublic, UserPublic } from "@/client";

interface UserProfileBannerProps {
  user?: UserPublic;
  profile?: UserProfilePublic;
  showEditButton?: boolean;
  bannerHeight?: { base: string, md: string };
  avatarSize?: string;
  avatarPosition?: {
    bottom: string;
    left: string;
  };
  onEditClick?: () => void;
}

const UserProfileBanner = ({
  user,
  profile,
  showEditButton = true,
  bannerHeight = { base: "100px", md: "150px" },
  avatarSize = "100px",
  avatarPosition = { bottom: "-40px", left: "20px" },
  onEditClick
}: UserProfileBannerProps) => {
  return (
    <Box border={{base: "1px solid", md: "none"}} borderColor={'gray.muted'} pb={{base: 2, md: 0}} borderBottomRadius={"lg"}>
      <Box h={bannerHeight} position="relative">
        <Image
          src={user?.avatar_url || '/fallback-banner.jpg'}
          alt="Banner"
          objectFit="cover"
          w="full"
          h="100%"
        />

        {showEditButton && (
          <IconButton
            aria-label="Edit"
            size="sm"
            position="absolute"
            top="10px"
            right="10px"
            borderRadius="full"
            boxShadow="md"
            onClick={onEditClick}
          >
            <FiEdit />
          </IconButton>
        )}

        {profile?.area_of_focus && profile?.area_of_focus.length > 0 && (
          <HStack
            position="absolute"
            bottom={{base: "4px", md: "8px"}}
            right="10px"
            gap={2}
            justify="flex-start"
            align="center"
            overflowX="auto"
            flexWrap="nowrap"
            maxW="55%"
            px={2}
            scrollbar={"hidden"}
          >
            {profile.area_of_focus.map((focus) => (
              <Tag
                key={focus}
                size="sm"
                bg="white"
                color="black"
                border={{ base: '1px solid', _dark: 'none' }}
                borderColor="black"
                borderRadius="sm"
                flexShrink={0}
                whiteSpace="nowrap"
              >
                {focus}
              </Tag>
            ))}
          </HStack>
        )}

        {/* Avatar */}
        <Avatar
          boxSize={avatarSize}
          src={user?.avatar_url}
          name={user?.full_name}
          position="absolute"
          bottom={avatarPosition.bottom}
          left={avatarPosition.left}
          border="2px solid"
          boxShadow="md"
        />
      </Box>

      <Box px={{base: 6, md: 8}} pt={8} pb={{base: 0, md: 3}}>
        <Flex direction="column" gap={4} position={'relative'}>
          {/* Header Profile Section */}
          <MenteeHeaderProfileSection  user={user} profile={profile}/>
        </Flex>
      </Box>
    </Box>
  )
}

export default UserProfileBanner