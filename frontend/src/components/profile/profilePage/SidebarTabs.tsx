import { VStack } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import { LuCalendar, LuClock4 } from "react-icons/lu";
import { FaServicestack } from "react-icons/fa6";
import MentorshipCalendarContent from "@/components/dashboard/calendar/MentorshipCalendarContent ";
import SessionsContent from "@/components/dashboard/mentor/sessions/SessionsContent";
import ServicesContent from "@/components/dashboard/mentor/services/ServicesContent";

interface SidebarTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  search: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mentorData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: any;
  readOnly: boolean;
  isOwnProfile: boolean;
}

const SidebarTabs = ({ search, mentorData, readOnly, isOwnProfile, handlers }: SidebarTabsProps) => {
  const tabs = [
    {
      value: "services",
      label: "Services",
      icon: FaServicestack,
      content: (
        <ServicesContent
          services={mentorData?.services || []}
          readOnly={readOnly}
          serviceModal={search.serviceModal}
          serviceId={search.serviceId}
          onOpenServiceModal={handlers.openServiceModal}
          onCloseServiceModal={handlers.closeServiceModal}
          onEdit={handlers.handleServiceEdit}
          onDelete={handlers.handleServiceDelete}
        />
      ),
    },
    {
      value: "sessions",
      label: "Sessions",
      icon: LuClock4,
      content: (
        <VStack gap={4} align="stretch">
          <SessionsContent
            sessions={mentorData?.sessions || []}
            readOnly={readOnly}
            sessionModal={search.sessionModal}
            sessionId={search.sessionId}
            onOpenSessionModal={handlers.openSessionModal}
            onCloseSessionModal={handlers.closeSessionModal}
            onEdit={handlers.handleSessionEdit}
            onDelete={handlers.handleSessionDelete}
            onViewDetails={handlers.handleSessionViewDetails}
          />
        </VStack>
      ),
    },
    {
      value: "availability",
      label: "Availability",
      icon: LuCalendar,
      content: (
        <MentorshipCalendarContent
          onEdit={handlers.handleSessionEdit}
          onDelete={handlers.handleSessionDelete}
          onViewDetails={handlers.handleSessionViewDetails}
          isOwnProfile={isOwnProfile}
          mentorSessions={mentorData?.sessions || []}
          mentorSettings={mentorData?.settings}
        />
      ),
    },
  ];

  return (
    <Tabs.Root
      value={search.st || "services"}
      onValueChange={(e) => handlers.handleSidebarTabChange(e.value)}
      variant="enclosed"
      w="full"
    >
      <Tabs.List justifyContent="space-between" w="full" bg="cardbg">
        {tabs.map(({ value, label, icon: Icon }) => (
          <Tabs.Trigger key={value} value={value} flex="1" justifyContent="center" fontWeight="medium">
            <Icon size={16} />
            {label}
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator />
      </Tabs.List>

      {tabs.map(({ value, content }) => (
        <Tabs.Content key={value} value={value} pt={4}>
          {content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default SidebarTabs;