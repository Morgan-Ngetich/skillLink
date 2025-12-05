import { VStack } from "@chakra-ui/react";
import PeopleAlsoViewed from "@/components/homepage/TopMentors";
import type { UserProfilePublic } from "@/client";
import ProfileCompletionCard from "@/components/other/ProfileCompletionCard";

interface MobileSidebarProps {
  isOwnProfile: boolean;
  personalProfile?: UserProfilePublic;
  onEditProfile: (step?: string) => void;
}

const MobileSidebar = ({ isOwnProfile, personalProfile, onEditProfile }: MobileSidebarProps) => {
  return (
    <VStack w="full" gap={6}>
      {isOwnProfile && !personalProfile?.is_profile_complete && (
        <ProfileCompletionCard onEditProfile={onEditProfile} />
      )}
      <PeopleAlsoViewed />
    </VStack>
  );
};

export default MobileSidebar;