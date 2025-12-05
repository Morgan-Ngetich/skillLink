import type { MentorSessionPublic } from '@/client';

/**
 * Add derived fields for calendar, but keep MentorSessionPublic intact
 */
export const transformSessionForCalendar = (
  session: MentorSessionPublic
): MentorSessionPublic & { status: "scheduled" | "completed" | "cancelled" | "in-progress"; banner?: string } => {
  const startDate = new Date(session.start_time);
  const endDate = new Date(session.end_time);

  const now = new Date();
  let status: "scheduled" | "completed" | "cancelled" | "in-progress";

  if (session.is_cancelled) {
    status = "cancelled";
  } else if (endDate < now) {
    status = "completed";
  } else if (startDate <= now && endDate >= now) {
    status = "in-progress";
  } else {
    status = "scheduled";
  }

  return {
    ...session, // keep everything exactly the same
    status,
    banner: session.cover_image || `https://picsum.photos/seed/${session.uuid}/800`,
  };
};

/**
 * Group sessions by date
 */
export const groupSessionsByDate = (
  sessions: MentorSessionPublic[]
): Record<string, (MentorSessionPublic & { status: "scheduled" | "completed" | "cancelled" | "in-progress"; banner?: string })[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped: Record<string, any[]> = {};

  sessions.forEach((session) => {
    const date = new Date(session.start_time);
    const dateString = date.toISOString().split('T')[0];

    if (!grouped[dateString]) grouped[dateString] = [];

    grouped[dateString].push(transformSessionForCalendar(session));
  });

  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  });

  return grouped;
};


export function formatDuration(minutes: number): string {
  const years = Math.floor(minutes / (60 * 24 * 365));
  const months = Math.floor((minutes % (60 * 24 * 365)) / (60 * 24 * 30));
  const days = Math.floor((minutes % (60 * 24 * 30)) / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;

  const parts = [];

  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}mo`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);

  return parts.length ? parts.join(" ") : "0m";
}

export function formatDurationMin(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(minutes / (60 * 24));
  const months = Math.floor(minutes / (60 * 24 * 30));
  const years = Math.floor(minutes / (60 * 24 * 365));

  if (years > 0) return `${years}y`;
  if (months > 0) return `${months}mo`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}
