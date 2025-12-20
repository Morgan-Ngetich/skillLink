import { VStack } from "@chakra-ui/react";
import PeopleAlsoViewed from "@/components/homepage/TopMentors";
import type { UserProfilePublic } from "@/client";
import ProfileCompletionCard from "@/components/other/ProfileCompletionCard";
import BecomeMentorCard from "@/components/dashboard/mentor/mentorProfileSetup/BecomeMentorCard";

interface MobileSidebarProps {
  isOwnProfile: boolean;
  personalProfile?: UserProfilePublic | null | undefined;
  onEditProfile: (step?: string) => void;
}


const MenteeSidebar = ({ isOwnProfile, personalProfile, onEditProfile }: MobileSidebarProps) => {
  return (
    <VStack w="full" gap={6}>
      {isOwnProfile && !personalProfile?.is_profile_complete && (
        <>
          <ProfileCompletionCard onEditProfile={onEditProfile} />
          <BecomeMentorCard />
        </>
      )}
      <PeopleAlsoViewed />
    </VStack>
  );
};

export default MenteeSidebar;