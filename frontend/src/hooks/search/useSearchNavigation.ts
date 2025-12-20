import { useNavigate } from "@tanstack/react-router";
import type { UnifiedSearchResult } from "@/components/common/search/types";
import type { MentorSessionPublic, MentorServicePublic, MentorExplorePublic } from "@/client";

export const useSearchNavigation = (urlQuery: string) => {
  const navigate = useNavigate();

  const handleResultClick = (result: UnifiedSearchResult) => {
    if (result.type === "mentor") {
      const mentor = result.data as MentorExplorePublic;
      navigate({ to: `/profile/${mentor.uuid}` });
    } else if (result.type === "session") {
      const session = result.data as MentorSessionPublic;
      navigate({
        to: `/explore`,
        search: {
          q: urlQuery || undefined,
          view: "sessions",
          sessionId: session.uuid,
        },
      });
    } else if (result.type === "service") {
      const service = result.data as MentorServicePublic;
      navigate({
        to: `/explore`,
        search: {
          q: urlQuery || undefined,
          view: "services",
          serviceId: service.uuid,
        },
      });
    }
  };

  return { handleResultClick };
};