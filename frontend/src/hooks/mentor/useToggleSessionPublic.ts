import { useState } from "react";
import { MentorsService, type MentorSessionPublic } from "@/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toNativePromise } from "@/utils/toNativePromisse";
import useToaster from '../public/useToaster';

interface TogglePublicOptions {
  onSuccess?: (session: MentorSessionPublic) => void;
  onError?: (error: Error) => void;
}

export const useToggleSessionPublic = () => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await toNativePromise(
        MentorsService.toggleSessionVisibilityApiV1MentorsSessionsSessionIdTogglePublicPatch({ 
          sessionId 
        })
      );
    },
    onSuccess: (data) => {
      // Invalidate and refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ["mentorSessions"] });
      queryClient.invalidateQueries({ queryKey: ["publicSessions"] });
      queryClient.invalidateQueries({
        queryKey: ["mentorSessions", "byMentor", data.mentor_id]
      });

      if (data.uuid) {
        queryClient.invalidateQueries({
          queryKey: ["mentorSession", data.uuid]
        });
      }
      queryClient.refetchQueries({
        queryKey: ["mentorSessions"],
        type: "active"
      });

      // Optionally update cache directly for optimistic UI (instant feedback)
      queryClient.setQueryData<MentorSessionPublic[]>(
        ["mentorSessions"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((session) =>
            session.id === data.id ? data : session
          );
        }
      );

      toast({
        id: "session-visibility-updated",
        title: "Session visibility updated",
        description: `Session is now ${data.is_public ? "public" : "private"}`,
        status: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        id: "failed-to-update-visibility",
        title: "Failed to update visibility",
        description: error.message || "Something went wrong",
        status: "error",
      });
    },
    onSettled: () => {
      setIsToggling(false);
    },
  });

  const togglePublic = async (
    session: MentorSessionPublic,
    options?: TogglePublicOptions
  ) => {
    setIsToggling(true);

    try {
      const result = await toggleMutation.mutateAsync(session.id);

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    }
  };

  return {
    togglePublic,
    isToggling: isToggling || toggleMutation.isPending,
  };
};