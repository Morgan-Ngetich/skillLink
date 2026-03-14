import { VStack } from "@chakra-ui/react";
import PeopleAlsoViewedMentors from "@/components/homepage/PeopleAlsoViewedMentors";
import type { UserProfilePublic } from "@/client";
import ProfileCompletionCard from "@/components/other/ProfileCompletionCard";
import BecomeMentorCard from "@/components/dashboard/mentor/mentorProfileSetup/BecomeMentorCard";

interface MobileSidebarProps {
  isOwnProfile: boolean;
  user_is_mentor: boolean;
  personalProfile?: UserProfilePublic | null;
  onEditProfile: (step?: string) => void;
}

const MenteeSidebarCards = ({ isOwnProfile, user_is_mentor, personalProfile, onEditProfile }: MobileSidebarProps) => {
  return (
    <VStack w="full" gap={6}>
      {isOwnProfile && !personalProfile?.is_profile_complete && (
        <ProfileCompletionCard onEditProfile={onEditProfile} />
      )}

      {isOwnProfile && !user_is_mentor && <BecomeMentorCard />}

      <PeopleAlsoViewedMentors />
    </VStack>
  );
};

export default MenteeSidebarCards;
