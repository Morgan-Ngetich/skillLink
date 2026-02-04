import {
  Box,
  CloseButton,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
} from "@/components/ui";
import type { MentorSessionPublic } from "@/client";
import SessionCard from "../mentor/sessions/SessionCard";

interface SessionDetailsProps {
  isOpen: boolean;
  date: string;
  sessions: MentorSessionPublic[];
  onClose: () => void;
  onEdit?: (session: MentorSessionPublic) => void;
  onDelete?: (session: MentorSessionPublic) => void;
  onViewDetails?: (session: MentorSessionPublic) => void;
  showActions?: boolean;
}

export function SessionDetails({
  isOpen,
  date,
  sessions,
  onClose,
  onEdit,
  onDelete,
  onViewDetails,
  showActions = false,
}: SessionDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      placement={{ base: "bottom", md: "center" }}
      size="md"
    >
      <DialogContent
        h={{ base: "85vh", md: "auto" }}
        maxH={{ base: "85vh", md: "80vh" }}
        maxW={{ base: "100%", md: "3xl" }}
        m={{ base: 0, md: 4 }}
        borderRadius={{ base: 0, md: "xl" }}
        borderTopRadius={{ base: "2xl", md: "xl" }}
      >
        {/* Mobile drag indicator */}
        <Box
          display={{ base: "block", md: "none" }}
          mx="auto"
          mt={2}
          mb={-2}
          bg="fg.muted"
          h="4px"
          w="40px"
          borderRadius="full"
          cursor="pointer"
          onClick={onClose}
        />

        <DialogHeader pb={4} borderBottom="1px solid" borderColor="border.subtle">
          <VStack align="start" gap={1}>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
              {formatDate(date)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled
            </Text>
          </VStack>
        </DialogHeader>

        <DialogCloseTrigger asChild>
          <CloseButton onClick={onClose} variant="ghost" size="sm" />
        </DialogCloseTrigger>

        <DialogBody overflowY="auto" p={{ base: 4, md: 6 }}>
          <Flex wrap="wrap" gap={4} justify={"center"}>
            {sessions.map((session) => (
              <Box
                key={session.id}
                flex={{ base: "1 1 100%", md: "1 1 calc(50% - 8px)", lg: "1 1 calc(33.333% - 11px)" }}
                minW="250px"
              >
                <SessionCard
                  isSmall={sessions.length > 1 ? true : false}
                  session={session}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                  showActions={showActions}
                />
              </Box>
            ))}
          </Flex>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}