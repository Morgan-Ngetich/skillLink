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

export const $UserProfilePublic = {
  properties: {
    user_id: { type: 'number', isRequired: true },
    uuid: { type: 'string', isRequired: true },
    bio: { type: 'string' },
    location: { type: 'string' },
    goals: {
      type: 'array',
      contains: { type: 'string' },
    },
    interests: {
      type: 'array',
      contains: { type: 'string' },
    },
    area_of_focus: {
      type: 'array',
      contains: { type: 'string' },
    },
    social_links: {
      type: 'dictionary',
      properties: { type: 'string' },
    },
    is_profile_complete: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
} as const;

export const $UserProfileCreate = {
  properties: {
    bio: { type: 'string' },
    location: { type: 'string' },
    goals: {
      type: 'any-of',
      contains: [
        { type: 'array', contains: { type: 'string' } },
        { type: 'string' },
      ],
    },
    interests: {
      type: 'any-of',
      contains: [
        { type: 'array', contains: { type: 'string' } },
        { type: 'string' },
      ],
    },
    area_of_focus: {
      type: 'any-of',
      contains: [
        { type: 'array', contains: { type: 'string' } },
        { type: 'string' },
      ],
    },
    social_links: {
      type: 'dictionary',
      properties: { type: 'string' },
    },
  },
} as const;

export const $UserProfileUpdate = {
  properties: {
    bio: { type: 'string' },
    location: { type: 'string' },
    goals: {
      type: 'any-of',
      contains: [
        { type: 'array', contains: { type: 'string' } },
        { type: 'string' },
      ],
    },
    interests: {
      type: 'any-of',
      contains: [
        { type: 'array', contains: { type: 'string' } },
        { type: 'string' },
      ],
    },
    area_of_focus: {
      type: 'any-of',
      contains: [
        { type: 'array', contains: { type: 'string' } },
        { type: 'string' },
      ],
    },
    social_links: {
      type: 'dictionary',
      properties: { type: 'string' },
    },
  },
} as const;

export const $MentorProfilePublic = {
  properties: {
    user_id: { type: 'number', isRequired: true },
    uuid: { type: 'string', isRequired: true },
    industry: { type: 'string' },
    expertise: {
      type: 'array',
      contains: { type: 'string' },
    },
    experience_level: { type: 'string' },
    available_times: {
      type: 'array',
      contains: { type: 'string' },
    },
    currently_open_to_mentees: { type: 'boolean', isRequired: true },
    contact_details: {
      type: 'dictionary',
      properties: { type: 'string' },
    },
    is_mentor_profile_complete: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time', isRequired: true },
    updated_at: { type: 'string', format: 'date-time', isRequired: true },
  },
} as const;

export const $MentorProfileCreate = {
  properties: {
    user_id: { type: 'number', isRequired: true },
    industry: { type: 'string' },
    expertise: {
      type: 'array',
      contains: { type: 'string' },
    },
    experience_level: { type: 'string' },
    available_times: {
      type: 'array',
      contains: { type: 'string' },
    },
    currently_open_to_mentees: { type: 'boolean' },
    contact_details: {
      type: 'dictionary',
      properties: { type: 'string' },
    },
  },
} as const;

export const $MentorProfileUpdate = {
  properties: {
    industry: { type: 'string' },
    expertise: {
      type: 'array',
      contains: { type: 'string' },
    },
    experience_level: { type: 'string' },
    available_times: {
      type: 'array',
      contains: { type: 'string' },
    },
    currently_open_to_mentees: { type: 'boolean' },
    contact_details: {
      type: 'dictionary',
      properties: { type: 'string' },
    },
  },
} as const;

export const $UserPublic = {
  properties: {
    id: { type: 'number', isRequired: true },
    uuid: { type: 'string', isRequired: true },
    full_name: { type: 'string', isRequired: true },
    email: { type: 'string', isRequired: true },
    avatar_url: { type: 'string' },
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
    count: {
      type: 'number',
      isRequired: true,
    },
  },
} as const;
