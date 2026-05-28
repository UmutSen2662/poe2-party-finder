/**
 * Seed data for local development.
 * This data is shared across all dev machines via git, so keep it deterministic.
 *
 * Each export is a { target, rows } object for one table.
 * seed.ts automatically picks up every export; just add a new constant.
 */

export const categories = {
  target: "categories",
  rows: [
    { id: 1, displayName: "Vaal Temple", imagePath: null },
    { id: 2, displayName: "Arbiter", imagePath: null },
    { id: 3, displayName: "Leveling", imagePath: null },
    { id: 4, displayName: "Xesth", imagePath: null },
    { id: 5, displayName: "King of the Mists", imagePath: null },
    { id: 6, displayName: "Olroth", imagePath: null },
    { id: 7, displayName: "Gold", imagePath: null },
  ],
};

export const leagues = {
  target: "leagues",
  rows: [
    { id: 1, name: "Standard", status: "active" },
    { id: 2, name: "Hardcore", status: "active" },
    { id: 3, name: "Fate of the Vaal", status: "active" },
    { id: 4, name: "Fate of the Vaal - HC", status: "inactive" },
  ],
};

export const currencies = {
  target: "currencies",
  rows: [
    { id: 1, name: "Chaos Orb", icon: null },
    { id: 2, name: "Divine Orb", icon: null },
    { id: 3, name: "Exalted Orb", icon: null },
  ],
};

export const admins = {
  target: "admins",
  rows: [
    {
      id: 1,
      email: "admin@poe2party.com",
      password: "hashed_secure_password_123",
      permissions: "Superadmin",
    },
    {
      id: 2,
      email: "mod@poe2party.com",
      password: "hashed_secure_password_456",
      permissions: "Moderator",
    },
  ],
};

export const badges = {
  target: "badges",
  rows: [
    {
      id: 1,
      name: "Test Badge One",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 2,
      name: "Test Badge Two",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 3,
      name: "Test Badge Three",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 4,
      name: "Test Badge Four",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 5,
      name: "Test Badge Five",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 6,
      name: "Test Badge Six",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 7,
      name: "Test Badge Seven",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 8,
      name: "Test Badge Eight",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 9,
      name: "Test Badge Nine",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
    {
      id: 10,
      name: "Test Badge Ten",
      icon: null,
      description: "Test badge for development",
      condition: {},
    },
  ],
};

export const badgeCategories = {
  target: "badge_categories",
  rows: [],
};

export const players = {
  target: "players",
  rows: [
    {
      id: 1,
      ign: "Emre",
      email: "emre@example.com",
      password: "$2b$10$DS6Nza/7LA5EOLfL51DNLeeV3iX.bxk82.3HiIB9aGAKk1/eVHhgu",
      oauth2: "oauth_token_111",
      templates: [],
      hostRating: 9.85,
      customerRating: 10,
      hostThumbsUp: 150,
      hostThumbsDown: 2,
      customerThumbsUp: 45,
      customerThumbsDown: 0,
    },
    {
      id: 2,
      ign: "Umut",
      email: "umut@example.com",
      password: "$2b$10$BwRZbm12YX3lMC91Bf7bc.numCt9LWv4eCrLn88DzGCnRI2SXBKN6",
      oauth2: "oauth_token_222",
      templates: [],
      hostRating: 9.2,
      customerRating: 8.85,
      hostThumbsUp: 85,
      hostThumbsDown: 8,
      customerThumbsUp: 20,
      customerThumbsDown: 3,
    },
    {
      id: 3,
      ign: "NoobPlayer",
      email: "noob@example.com",
      password: "$2b$10$2AcsXHvwc1jmqBEa1L7c0O2PqsIbsPfUzH9i.sC4k8ncCQjzsKEyu",
      oauth2: "oauth_token_333",
      templates: [],
      hostRating: 0,
      customerRating: 10,
      hostThumbsUp: 0,
      hostThumbsDown: 0,
      customerThumbsUp: 15,
      customerThumbsDown: 0,
    },
    {
      id: 4,
      ign: "ToxicPlayer",
      email: "toxic@example.com",
      password: "$2b$10$8Hr9OAph4jtlqpZth0dgje7Ag4y2DyU0i8.C1/fGDWLyYeJeEUDtm",
      oauth2: "oauth_token_444",
      templates: [],
      hostRating: 4.5,
      customerRating: 3.0,
      hostThumbsUp: 10,
      hostThumbsDown: 12,
      customerThumbsUp: 5,
      customerThumbsDown: 10,
    },
  ],
};

export const earns = {
  target: "earns",
  rows: [
    { playerId: 1, badgeId: 1, pinned: true },
    { playerId: 1, badgeId: 3, pinned: false },
    { playerId: 1, badgeId: 5, pinned: false },
    { playerId: 1, badgeId: 7, pinned: false },
    { playerId: 1, badgeId: 9, pinned: false },
    { playerId: 2, badgeId: 2, pinned: true },
    { playerId: 2, badgeId: 4, pinned: false },
    { playerId: 2, badgeId: 6, pinned: false },
    { playerId: 2, badgeId: 8, pinned: false },
    { playerId: 2, badgeId: 10, pinned: false },
  ],
};

export const parties = {
  target: "parties",
  rows: [],
};

export const applies = {
  target: "applies",
  rows: [],
};

export const ratings = {
  target: "ratings",
  rows: [],
};

export const posts = {
  target: "posts",
  rows: [
    {
      title: "Vaal Temple Carry UBER daddy carries you",
      content:
        "Come to temple, stay behind 1 room, get your free carry, can loot currencies under 1 div",
    },
  ],
};
