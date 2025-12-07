import { Box } from "@chakra-ui/react";
import { MentorResultItem } from "./results/MentorResultItem";
import { SessionResultItem } from "./results/SessionResultItem";
import { ServiceResultItem } from "./results/ServiceResultItem";
import type { UnifiedSearchResult } from "../types";
import type { UserPublic, MentorSessionPublic, MentorServicePublic } from "@/client";

interface SearchResultItemProps {
  result: UnifiedSearchResult;
  onClick: (result: UnifiedSearchResult) => void;
}

export const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  const handleClick = () => onClick(result);

  const commonProps = {
    onClick: handleClick,
    cursor: "pointer" as const,
    _hover: { bg: "bg.muted" },
    transition: "background 0.15s",
  };

  if (result.type === "mentor") {
    return (
      <Box {...commonProps}>
        <MentorResultItem mentor={result.data as UserPublic} />
      </Box>
    );
  }

  if (result.type === "session") {
    return (
      <Box {...commonProps}>
        <SessionResultItem session={result.data as MentorSessionPublic} />
      </Box>
    );
  }

  if (result.type === "service") {
    return (
      <Box {...commonProps}>
        <ServiceResultItem service={result.data as MentorServicePublic} />
      </Box>
    );
  }

  return null;
};