import {
  FiCode,
  FiBriefcase,
  FiPenTool,
  FiHeart,
  FiBookOpen,
  FiCamera,
  FiMusic,
  FiGlobe,
  FiCpu,
  FiDollarSign,
  FiUsers,
  FiStar,
} from 'react-icons/fi';
import { type IconType } from 'react-icons/lib';

// 👇 Key-based definition (type-safe & dynamic)
export const focusOptionMap = {
  tech: { label: 'Tech', icon: FiCode },
  business: { label: 'Business', icon: FiBriefcase },
  design: { label: 'Design', icon: FiPenTool },
  wellness: { label: 'Wellness', icon: FiHeart },
  education: { label: 'Education', icon: FiBookOpen },
  photography: { label: 'Photography', icon: FiCamera },
  music: { label: 'Music', icon: FiMusic },
  travel: { label: 'Travel', icon: FiGlobe },
  engineering: { label: 'Engineering', icon: FiCpu },
  finance: { label: 'Finance', icon: FiDollarSign },
  community: { label: 'Community', icon: FiUsers },
  creativity: { label: 'Creativity', icon: FiStar },
} as const;


export type AreaOfFocus = keyof typeof focusOptionMap;
export type TagType = 'goal' | 'interest';

export interface FocusOption {
  label: string;
  icon: IconType;
}

export interface FocusTag {
  label: string;
  type: TagType;
}

// Get full list as array (if needed)
export const goalsFocusOptions: (FocusOption & { value: AreaOfFocus })[] = Object.entries(focusOptionMap).map(
  ([value, { label, icon }]) => ({
    value: value as AreaOfFocus,
    label,
    icon,
  })
);

// Unified goals + interests suggestions per focus area
export const focusDetailsMap: Record<AreaOfFocus, FocusTag[]> = {
  tech: [
    { label: 'Learn to code', type: 'goal' },
    { label: 'Build a tech portfolio', type: 'goal' },
    { label: 'Get a tech internship', type: 'goal' },
    { label: 'Master a framework', type: 'goal' },
    { label: 'Hackathons', type: 'interest' },
    { label: 'Tech podcasts', type: 'interest' },
    { label: 'Open source contributions', type: 'interest' },
  ],
  business: [
    { label: 'Start a business', type: 'goal' },
    { label: 'Build a pitch deck', type: 'goal' },
    { label: 'Find co-founders', type: 'goal' },
    { label: 'Learn marketing basics', type: 'goal' },
    { label: 'Business books', type: 'interest' },
    { label: 'Startup news', type: 'interest' },
    { label: 'Networking events', type: 'interest' },
  ],
  design: [
    { label: 'Master Figma', type: 'goal' },
    { label: 'Create a case study', type: 'goal' },
    { label: 'Redesign a product', type: 'goal' },
    { label: 'Build a portfolio', type: 'goal' },
    { label: 'UI inspiration', type: 'interest' },
    { label: 'Design blogs', type: 'interest' },
    { label: 'Design communities', type: 'interest' },
  ],
  wellness: [
    { label: 'Improve work-life balance', type: 'goal' },
    { label: 'Practice mindfulness', type: 'goal' },
    { label: 'Start journaling', type: 'goal' },
    { label: 'Yoga classes', type: 'interest' },
    { label: 'Meditation groups', type: 'interest' },
  ],
  education: [
    { label: 'Finish a course', type: 'goal' },
    { label: 'Improve study habits', type: 'goal' },
    { label: 'Start a blog', type: 'goal' },
    { label: 'Online lectures', type: 'interest' },
    { label: 'Book clubs', type: 'interest' },
  ],
  photography: [
    { label: 'Build a photo portfolio', type: 'goal' },
    { label: 'Learn editing', type: 'goal' },
    { label: 'Shoot 30 days straight', type: 'goal' },
    { label: 'Photo walks', type: 'interest' },
    { label: 'Photography contests', type: 'interest' },
  ],
  music: [
    { label: 'Release a track', type: 'goal' },
    { label: 'Learn music production', type: 'goal' },
    { label: 'Join a music group', type: 'goal' },
    { label: 'Music festivals', type: 'interest' },
    { label: 'Jam sessions', type: 'interest' },
  ],
  travel: [
    { label: 'Plan a cultural trip', type: 'goal' },
    { label: 'Document my travels', type: 'goal' },
    { label: 'Work remotely abroad', type: 'goal' },
    { label: 'Travel blogs', type: 'interest' },
    { label: 'Backpacking groups', type: 'interest' },
  ],
  engineering: [
    { label: 'Build a side project', type: 'goal' },
    { label: 'Contribute to open source', type: 'goal' },
    { label: 'Strengthen problem-solving', type: 'goal' },
    { label: 'Tech meetups', type: 'interest' },
    { label: 'Engineering podcasts', type: 'interest' },
  ],
  finance: [
    { label: 'Start budgeting', type: 'goal' },
    { label: 'Track expenses', type: 'goal' },
    { label: 'Build an emergency fund', type: 'goal' },
    { label: 'Personal finance blogs', type: 'interest' },
    { label: 'Investment clubs', type: 'interest' },
  ],
  community: [
    { label: 'Host a local event', type: 'goal' },
    { label: 'Volunteer weekly', type: 'goal' },
    { label: 'Start a community group', type: 'goal' },
    { label: 'Community projects', type: 'interest' },
    { label: 'Local meetups', type: 'interest' },
  ],
  creativity: [
    { label: 'Do a 30-day challenge', type: 'goal' },
    { label: 'Start a creative habit', type: 'goal' },
    { label: 'Share my work online', type: 'goal' },
    { label: 'Creative workshops', type: 'interest' },
    { label: 'Art exhibitions', type: 'interest' },
  ],
};
