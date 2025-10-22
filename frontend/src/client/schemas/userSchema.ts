// ---------- USER ----------
export const $UserSyncIn = {
  properties: {
    user_id: { type: 'string', isRequired: true },
    email: { type: 'string', isRequired: true },
    full_name: {
      type: 'any-of',
      contains: [{ type: 'string' }, { type: 'null' }],
      default: null,
    },
    avatar_url: {
      type: 'any-of',
      contains: [{ type: 'string' }, { type: 'null' }],
      default: null,
    },
  },
} as const;

export const $UserCreate = {
  properties: {
    full_name: { type: 'string', isRequired: true },
    email: { type: 'string', isRequired: true },
    password: { type: 'string', isRequired: true },
    is_active: { type: 'boolean', isRequired: true },
  },
} as const;

export const $UserUpdate = {
  properties: {
    full_name: { type: 'string' },
    avatar_url: { type: 'string' },
    is_active: { type: 'boolean' },
    email: { type: 'string' },
  },
} as const;

// ---------- EDUCATION & EXPERIENCE ----------
export const $Education = {
  properties: {
    institution: { type: 'string', isRequired: true },
    logo: { type: 'string' },
    degree: { type: 'string', isRequired: true },
    field_of_study: { type: 'string' },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
  },
} as const;

export const $Experience = {
  properties: {
    company: { type: 'string', isRequired: true },
    logo: { type: 'string' },
    position: { type: 'string' },
    description: { type: 'string' },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
  },
} as const;

// ---------- USER PROFILE ----------
export const $UserProfilePublic = {
  properties: {
    user_id: { type: 'number', isRequired: true },
    uuid: { type: 'string', isRequired: true },
    title: { type: 'string' },
    about: { type: 'string' },
    location: { type: 'string' },
    goals: { type: 'array', contains: { type: 'string' } },
    education: { type: 'array', contains: { type: 'Education' } },
    experience: { type: 'array', contains: { type: 'Experience' } },
    skills: { type: 'array', contains: { type: 'string' } },
    contact_details: { type: 'dictionary', properties: { type: 'string' } },
    interests: { type: 'array', contains: { type: 'string' } },
    area_of_focus: { type: 'array', contains: { type: 'string' } },
    social_links: { type: 'dictionary', properties: { type: 'string' } },
    is_profile_complete: { type: 'boolean' },
    is_profile_setup_complete: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
} as const;

export const $UserProfileCreate = {
  properties: {
    title: { type: 'string' },
    about: { type: 'string' },
    contact_details: { type: 'dictionary', properties: { type: 'string' } },
    skills: { type: 'array', contains: { type: 'string' } },
    location: { type: 'string' },
    goals: { type: 'array', contains: { type: 'string' } },
    interests: { type: 'array', contains: { type: 'string' } },
    experience: { type: 'array', contains: { type: 'Experience' } },
    education: { type: 'array', contains: { type: 'Education' } },
    area_of_focus: { type: 'array', contains: { type: 'string' } },
    social_links: { type: 'dictionary', properties: { type: 'string' } },
  },
} as const;

export const $UserProfileUpdate = $UserProfileCreate;

// ---------- MENTOR PROFILE ----------
export const $MentorProfilePublic = {
  properties: {
    user_id: { type: 'number', isRequired: true },
    title: { type: 'string', isRequired: true },
    industries: { type: 'array', contains: { type: 'string' } },
    expertise: { type: 'array', contains: { type: 'string' } },
    experience_level: { type: 'string' },
    mentor_type: { type: 'array', contains: { type: 'string' } },
    tags: { type: 'array', contains: { type: 'string' } },
    badges: { type: 'array', contains: { type: 'string' } },
    total_sessions: { type: 'number' },
    total_mentees: { type: 'number' },
    average_rating: { type: 'any-of', contains: [{ type: 'number' }, { type: 'null' }] },
    currently_open_to_mentees: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
} as const;

export const $MentorProfileCreate = {
  properties: {
    user_id: { type: 'number', isRequired: true },
    title: { type: 'string', isRequired: true },
    industries: { type: 'array', contains: { type: 'string' } },
    expertise: { type: 'array', contains: { type: 'string' } },
    experience_level: { type: 'string' },
    mentor_type: { type: 'array', contains: { type: 'string' } },
    tags: { type: 'array', contains: { type: 'string' } },
    badges: { type: 'array', contains: { type: 'string' } },
  },
} as const;

export const $MentorProfileUpdate = {
  properties: {
    title: { type: 'string' },
    industries: { type: 'array', contains: { type: 'string' } },
    expertise: { type: 'array', contains: { type: 'string' } },
    experience_level: { type: 'string' },
    mentor_type: { type: 'array', contains: { type: 'string' } },
    tags: { type: 'array', contains: { type: 'string' } },
    badges: { type: 'array', contains: { type: 'string' } },
  },
} as const;

// ---------- USER PUBLIC ----------
export const $UserPublic = {
  properties: {
    id: { type: 'number', isRequired: true },
    uuid: { type: 'string', isRequired: true },
    full_name: { type: 'string', isRequired: true },
    email: { type: 'string', isRequired: true },
    avatar_url: { type: 'string' },
    cover_image: { type: 'string' },
    is_superuser: { type: 'boolean', isRequired: true },
    is_mentor: { type: 'boolean', isRequired: true },
    is_mentee: { type: 'boolean', isRequired: true },
    profile: { type: 'UserProfilePublic' },
    mentor_profile: { type: 'MentorProfilePublic' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
} as const;

export const $UsersPublic = {
  properties: {
    data: {
      type: 'array',
      contains: { type: 'UserPublic' },
      isRequired: true,
    },
    count: { type: 'number', isRequired: true },
  },
} as const;
