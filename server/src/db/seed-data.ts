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
    { id: 1, displayName: "Vaal Temple", imagePath: "vaal_temple.png" },
    { id: 2, displayName: "Arbiter", imagePath: "arbiter.png" },
    { id: 3, displayName: "Leveling", imagePath: "leveling.png" },
    { id: 4, displayName: "Xesth", imagePath: "xesth.png" },
    {
      id: 5,
      displayName: "King of the Mists",
      imagePath: "king_of_the_mists.png",
    },
    { id: 6, displayName: "Olroth", imagePath: "olroth.png" },
    { id: 7, displayName: "Gold", imagePath: "gold.png" },
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
    { id: 1, name: "Chaos Orb", icon: "chaos.png" },
    { id: 2, name: "Divine Orb", icon: "divine.png" },
    { id: 3, name: "Exalted Orb", icon: "exalt.png" },
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
      name: "King Slayer",
      icon: "slayer_badge.png",
      description: "Successfully host 50 King of the Mists carries.",
      condition: { target: 50, metric: "successful_runs" },
    },
    {
      id: 2,
      name: "Master Mentor",
      icon: "guide_badge.png",
      description: "Maintain a 9.50 positive rating over 100 Leveling runs.",
      condition: { target: 9.5, metric: "rating_score" },
    },
  ],
};

export const badgeCategories = {
  target: "badge_categories",
  rows: [
    { badgeId: 1, categoryId: 5 },
    { badgeId: 2, categoryId: 3 },
  ],
};

export const players = {
  target: "players",
  rows: [
    {
      id: 1,
      ign: "Emre",
      oauth2: "oauth_token_111",
      templates: [
        { name: "Fast Olroth", text: "WTS Olroth Kill, fast and safe." },
      ],
      hostRating: 98.5,
      customerRating: 100,
      hostThumbsUp: 150,
      hostThumbsDown: 2,
      customerThumbsUp: 45,
      customerThumbsDown: 0,
    },
    {
      id: 2,
      ign: "Umut",
      oauth2: "oauth_token_222",
      templates: [{ name: "Gold Farm", text: "Hosting Gold runs, AFK spot." }],
      hostRating: 92,
      customerRating: 88.5,
      hostThumbsUp: 85,
      hostThumbsDown: 8,
      customerThumbsUp: 20,
      customerThumbsDown: 3,
    },
    {
      id: 3,
      ign: "NoobPlayer",
      oauth2: "oauth_token_333",
      templates: [],
      hostRating: 0,
      customerRating: 100,
      hostThumbsUp: 0,
      hostThumbsDown: 0,
      customerThumbsUp: 15,
      customerThumbsDown: 0,
    },
    {
      id: 4,
      ign: "ToxicPlayer",
      oauth2: "oauth_token_444",
      templates: [],
      hostRating: 45,
      customerRating: 30,
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
    { playerId: 2, badgeId: 2, pinned: false },
  ],
};

export const parties = {
  target: "parties",
  rows: [
    {
      id: 1,
      title: "Olroth Kill - EU Server",
      description: "Bring your own entry, stay dead if you die.",
      capacity: 5,
      status: "gathering",
      cost: 2,
      hostId: 1,
      leagueId: 3,
      categoryId: 6,
      currencyId: 2,
    },
    {
      id: 2,
      title: "Gold Farm - 5 runs",
      description: "Resetting fast, stay AFK.",
      capacity: 5,
      status: "started",
      cost: 50,
      hostId: 2,
      leagueId: 1,
      categoryId: 7,
      currencyId: 1,
    },
    {
      id: 3,
      title: "King of the Mists Carry",
      description: "Quick kill.",
      capacity: 5,
      status: "ended",
      cost: 1,
      hostId: 1,
      leagueId: 1,
      categoryId: 5,
      currencyId: 2,
    },
  ],
};

export const applies = {
  target: "applies",
  rows: [
    { playerId: 2, partyId: 1, status: "pending" },
    { playerId: 3, partyId: 1, status: "accepted" },
    { playerId: 3, partyId: 2, status: "accepted" },
    { playerId: 4, partyId: 2, status: "rejected" },
    { playerId: 3, partyId: 3, status: "accepted" },
    { playerId: 4, partyId: 3, status: "accepted" },
  ],
};

export const ratings = {
  target: "ratings",
  rows: [
    { id: 1, value: 1, giverId: 3, receiverId: 1, partyId: 3 },
    { id: 2, value: 1, giverId: 1, receiverId: 3, partyId: 3 },
    { id: 3, value: -1, giverId: 4, receiverId: 1, partyId: 3 },
    { id: 4, value: -1, giverId: 1, receiverId: 4, partyId: 3 },
  ],
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
