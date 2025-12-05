import { VStack } from "@chakra-ui/react";
import PeopleAlsoViewed from "@/components/homepage/TopMentors";
import SidebarTabs from "./SidebarTabs";

interface DesktopSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  search: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mentorData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: any;
  readOnly: boolean;
  isOwnProfile: boolean;
}

const DesktopSidebar = ({ search, mentorData, readOnly, isOwnProfile, handlers }: DesktopSidebarProps) => {
  return (
    <VStack gap={6} align="start" flex="0 0 36%" w="36%">
      <SidebarTabs
        search={search}
        mentorData={mentorData}
        readOnly={readOnly}
        isOwnProfile={isOwnProfile}
        handlers={handlers}
      />
      <PeopleAlsoViewed />
    </VStack>
  );
};

export default DesktopSidebar;