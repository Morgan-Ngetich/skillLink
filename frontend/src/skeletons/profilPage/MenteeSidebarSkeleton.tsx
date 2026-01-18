import { VStack } from "@chakra-ui/react";
import ProfileCompletionCardSkeleton from "./ProfileCompletionCardSkeleton";
import { PeopleAlsoViewedSkeleton } from "../PeopleAlsoViewedSkeleton"
import BecomeMentorCardSkeleton from "./BecomeMentorCardSkeleton";

export default function MenteeSidebarSkeleton() {
  return (
    <VStack w="full" gap={6}>
      <ProfileCompletionCardSkeleton />
      <BecomeMentorCardSkeleton />
      <PeopleAlsoViewedSkeleton />
    </VStack>
  );
}
