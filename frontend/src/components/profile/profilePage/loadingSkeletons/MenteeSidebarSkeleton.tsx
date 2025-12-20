import { VStack } from "@chakra-ui/react";
import ProfileCompletionCardSkeleton from "./ProfileCompletionCardSkeleton";
import BecomeMentorCardSkeleton from "./BecomeMentorCardSkeleton";
import { PeopleAlsoViewedSkeleton } from "./PeopleAlsoViewedSkeleton"

export default function MenteeSidebarSkeleton() {
  return (
    <VStack w="full" gap={6}>
      <ProfileCompletionCardSkeleton />
      <BecomeMentorCardSkeleton />
      <PeopleAlsoViewedSkeleton />
    </VStack>
  );
}
