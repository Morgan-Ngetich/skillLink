export const $UserPublic = {
  properties: {
    id: {
      type: 'number',
      isRequired: true,
    },
    email: {
      type: 'string',
      isRequired: true,
    },
    full_name: {
      type: 'any-of',
      contains: [{
        type: 'string',
      }, {
        type: 'null',
      }],
    },
    role: {
      type: "string",
      enum: ["superuser", "loggeduser", "mentor"], // Restrict role values
      default: "loggeduser", // Default role
    },

  },
} as const;


export const $UserSyncIn = {
  properties: {
    user_uuid: {
      type: 'number',
      isRequired: true,
    },
    email: {
      type: 'string',
      isRequired: true,
    },
    full_name: {
      type: 'any-of',
      contains: [{
        type: 'string',
      }, {
        type: 'null',
      }],
    },
  },
} as const;