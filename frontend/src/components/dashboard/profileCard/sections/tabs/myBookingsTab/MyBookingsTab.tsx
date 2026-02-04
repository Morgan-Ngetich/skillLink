import {
  Container,
  Tabs,
} from "@chakra-ui/react";
import { LuList, LuCalendarDays } from "react-icons/lu";
import type { BookingPublic } from "@/client";
import MyBookingsListView from "./MyBookingsListView";
import MyBookingsCalendarView from "./MyBookingsCalendarView";

interface MyBookingsTabProps {
  onViewBooking?: (booking: BookingPublic) => void;
  onCancelBooking?: (booking: BookingPublic) => void;
  onEditBooking?: (booking: BookingPublic) => void;
  isOwnProfile?: boolean;
}

const MyBookingsTab: React.FC<MyBookingsTabProps> = ({
  isOwnProfile = false,
  onViewBooking,
  onCancelBooking,
  onEditBooking,
}) => {

  console.log("MyBookingsTab render - isOwnProfile:", isOwnProfile);
  // Get initial view from URL or default to list
  const getInitialView = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("bookingsView");
    return viewParam === "calendar" ? "calendar" : "list";
  };

  // Update URL when tab changes
  const handleTabChange = (details: { value: string }) => {
    const url = new URL(window.location.href);
    url.searchParams.set("bookingsView", details.value);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <Container maxW="4xl" p={0}>
      <Tabs.Root
        defaultValue={getInitialView()}
        onValueChange={handleTabChange}
        variant="outline"
      >
        <Tabs.List>
          <Tabs.Trigger value="list">
            <LuList />
            List View
          </Tabs.Trigger>
          <Tabs.Trigger value="calendar">
            <LuCalendarDays />
            Calendar
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="list">
          <MyBookingsListView
            onViewSession={onViewBooking}
            onCancelBooking={onCancelBooking}
            onEdit={onEditBooking}
            isOwnProfile={isOwnProfile}
          />
        </Tabs.Content>

        <Tabs.Content value="calendar">
          <MyBookingsCalendarView
            onViewBooking={onViewBooking}
            onCancelBooking={onCancelBooking}
            onEditBooking={onEditBooking}
            isOwnProfile={isOwnProfile}
          />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
};

export default MyBookingsTab;