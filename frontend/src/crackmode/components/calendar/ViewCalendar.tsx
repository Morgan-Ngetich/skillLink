import { Box, CloseButton } from "@chakra-ui/react";
import React, { useState } from "react";
import CalendarContent from "./CalendarContent";
import { DialogRoot, DialogContent, DialogBody, DialogCloseTrigger } from "@/components/ui";
import { type LeetcodeProblem, mockProblems } from "@/crackmode/types/calendar";

interface ViewCalendarProps {
  isOpen?: boolean;
  onClose?: () => void
  page?: string;
}

const ViewCalendar: React.FC<ViewCalendarProps> = ({ isOpen, onClose, page }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<LeetcodeProblem[]>([]);
  // const isMobile = useBreakpointValue({ base: true, md: false });

  const handleDateClick = (dateString: string) => {
    const problems = mockProblems[dateString] || [];
    setSelectedDate(dateString);
    setSelectedProblems(problems);
  };

  const handleCloseDetails = () => {
    setSelectedDate(null);
    setSelectedProblems([]);
  };

  if (page === "crackmode/docs") {
    return (
      <DialogRoot open={isOpen} onOpenChange={onClose} placement={"center"}>
        <DialogContent border="1px solid" borderColor="cardbg">
          <DialogCloseTrigger asChild >
            <CloseButton onClick={onClose} variant={'surface'} />
          </DialogCloseTrigger>
          <DialogBody pt={6}>
            <CalendarContent
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
              selectedProblems={selectedProblems}
              handleCloseDetails={handleCloseDetails}
            />
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    );
  }

  return (
    <Box>
      <CalendarContent
        onDateClick={handleDateClick}
        selectedDate={selectedDate}
        selectedProblems={selectedProblems}
        handleCloseDetails={handleCloseDetails}
      />
    </Box>
  );
};

export default ViewCalendar;
