import { Box, VStack, Text, Image, Skeleton, IconButton } from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/auth/useAuth';
import { LuCamera } from 'react-icons/lu';
import { useProfileImageUpload } from '@/hooks/supabase/useSupabaseStorage';

const UserProfileCard = () => {
  const { user, isLoading } = useAuth();

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

  if (isLoading || !user) {
    return (
      <Box
        w="full"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        border="1px solid"
        borderColor="border"
      >
        <Box position="relative" h="120px">
          <Skeleton w="full" h="100%" />
          <Box
            position="absolute"
            bottom="-40px"
            left="20px"
            border="4px solid"
            borderColor="bg"
            borderRadius="full"
          >
            <Skeleton boxSize="80px" borderRadius="full" />
          </Box>
        </Box>
        <VStack align="start" gap={2} pt={12} pb={4} px={4}>
          <Skeleton height="20px" width="60%" />
          <Skeleton height="16px" width="80%" />
        </VStack>
      </Box>
    );
  }

  const currentAvatar = avatarPreview || user.avatar_url;
  const currentCover = coverPreview || user.cover_image;

  return (
    <Box
      w="full"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      border="1px solid"
      borderColor="border"
    >
      {/* Banner */}
      <Box position="relative" h="90px" bg="bg.emphasized">
        <Image
          src={
            currentCover ||
            'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=200&fit=crop'
          }
          alt="Profile Banner"
          objectFit="cover"
          w="full"
          h="100%"
        />

        <IconButton
          aria-label="Upload cover"
          size="sm"
          position="absolute"
          top={2}
          right={2}
          borderRadius="full"
          colorPalette="blue"
          onClick={triggerCoverInput}
          loading={isProcessing}
          disabled={isProcessing}
          border="2px solid"
          borderColor="bg"
        >
          <LuCamera size={14} />
        </IconButton>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleCoverChange}
          disabled={isProcessing}
        />

        {/* Avatar with upload button */}
        <Box position="absolute" bottom="-40px" left="20px">
          <Box position="relative">
            <Avatar
              size="2xl"
              src={currentAvatar || ''}
              name={user.full_name || user.email || 'User'}
              border="1px solid"
            />

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
              borderColor="bg.emphasized"
            >
              <LuCamera />
            </IconButton>
          </Box>
        </Box>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
          disabled={isProcessing}
        />
      </Box>

      {/* User Info */}
      <VStack align="start" gap={1} pt={12} pb={4} px={4}>
        <Text fontWeight="bold" fontSize="lg" lineHeight="1.2">
          {user.full_name || 'Add your name'}
        </Text>
        <Text fontSize="sm" color="fg.muted">
          {user.email}
        </Text>
      </VStack>
    </Box>
  );
};

export default UserProfileCard;