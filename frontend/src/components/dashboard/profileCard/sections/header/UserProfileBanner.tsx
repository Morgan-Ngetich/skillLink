import { Box, Image, IconButton, HStack, Flex } from "@chakra-ui/react"
import { Avatar, Tag } from "@/components/ui"
import { FiEdit } from "react-icons/fi"
import { LuCamera } from "react-icons/lu"
import type { UserProfilePublic, UserPublic } from "@/client"
import { useProfileImageUpload } from "@/hooks/supabase/useSupabaseStorage"
import HeaderProfileSection from "./HeaderProfileSection"


interface UserProfileBannerProps {
  user?: UserPublic;
  profile?: UserProfilePublic;
  bannerHeight?: { base: string, md: string };
  avatarSize?: string;
  avatarPosition?: {
    bottom: string;
    left: string;
  };
  onEditClick?: () => void;
  readOnly: boolean;

  // Settings props
  onOpenSettings?: () => void;
}

const UserProfileBanner = ({
  user,
  profile,
  bannerHeight = { base: "100px", md: "150px" },
  avatarSize = "100px",
  avatarPosition = { bottom: "-40px", left: "20px" },
  onEditClick,
  readOnly,
  onOpenSettings,
}: UserProfileBannerProps) => {
  // Avatar upload hook
  const {
    preview: avatarPreview,
    fileInputRef: avatarInputRef,
    isProcessing: isAvatarProcessing,
    handleFileChange: handleAvatarChange,
    triggerFileInput: triggerAvatarInput,
  } = useProfileImageUpload({ type: 'avatar' });

  // Cover upload hook
  const {
    preview: coverPreview,
    fileInputRef: coverInputRef,
    isProcessing: isCoverProcessing,
    handleFileChange: handleCoverChange,
    triggerFileInput: triggerCoverInput,
  } = useProfileImageUpload({ type: 'cover' });

  const isProcessing = isAvatarProcessing || isCoverProcessing;

  // Use preview if uploading, otherwise use actual user data
  const currentAvatar = avatarPreview || user?.avatar_url;
  const currentCover = coverPreview || user?.cover_image || user?.avatar_url;

  return (
    <Box 
      border={{ base: "1px solid", md: "none" }} 
      borderColor={'gray.muted'} 
      pb={{ base: 2, md: 0 }} 
      borderBottomRadius={"lg"}
    >
      <Box h={bannerHeight} position="relative">
        <Image
          src={currentCover || '/fallback-banner.jpg'}
          alt="Banner"
          objectFit="cover"
          w="full"
          h="100%"
        />

        {!readOnly && (
          <>
            {/* Cover Upload Button */}
            <IconButton
              aria-label="Upload cover image"
              size="sm"
              position="absolute"
              top="10px"
              right={onEditClick ? "60px" : "10px"}
              borderRadius="full"
              boxShadow="md"
              colorPalette="blue"
              onClick={triggerCoverInput}
              loading={isProcessing}
              disabled={isProcessing}
              border="2px solid"
              borderColor="bg"
            >
              <LuCamera />
            </IconButton>

            {/* Hidden cover input */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleCoverChange}
              disabled={isProcessing}
            />

            {/* Edit Profile Button */}
            {onEditClick && (
              <IconButton
                aria-label="Edit profile"
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
          </>
        )}

        {/* Area of Focus Tags */}
        {profile?.area_of_focus && profile?.area_of_focus.length > 0 && (
          <HStack
            position="absolute"
            bottom={{ base: "4px", md: "8px" }}
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

        {/* Avatar with Upload Button */}
        <Box 
          position="absolute" 
          bottom={avatarPosition.bottom} 
          left={avatarPosition.left}
        >
          <Box position="relative">
            <Avatar
              boxSize={avatarSize}
              src={currentAvatar}
              name={user?.full_name}
              border="2px solid"
              boxShadow="md"
            />

            {/* Avatar Upload Button (only for own profile) */}
            {!readOnly && (
              <>
                <IconButton
                  aria-label="Upload avatar"
                  size="xs"
                  position="absolute"
                  bottom={-1}
                  right={-2}
                  borderRadius="full"
                  colorPalette="blue"
                  onClick={triggerAvatarInput}
                  loading={isProcessing}
                  disabled={isProcessing}
                  border="2px solid"
                  borderColor="bg"
                >
                  <LuCamera />
                </IconButton>

                {/* Hidden avatar input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                  disabled={isProcessing}
                />
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box px={{ base: 6, md: 8 }} pt={8} pb={{ base: 0, md: 3 }}>
        <Flex direction="column" gap={4} position={'relative'}>
          {/* Header Profile Section */}
          <HeaderProfileSection
            user={user}
            readOnly={readOnly}
            profile={profile}
            onOpenSettings={onOpenSettings} 
          />
        </Flex>
      </Box>
    </Box>
  )
}

export default UserProfileBanner