/**
 * Seed data for local development.
 * This data is shared across all dev machines via git — keep it deterministic.
 *
 * Each export is a { target, rows } object for one table.
 * seed.ts automatically picks up every export — just add a new constant.
 */

export const categories = {
  target: "categories",
  rows: [
    { displayName: "Vaal Temple" },
    { displayName: "Arbiter" },
    { displayName: "Leveling" },
    { displayName: "Xesth" },
    { displayName: "King of the Mists" },
    { displayName: "Olroth" },
    { displayName: "Gold" },
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
    {
      title: "Arbiter Carry",
      content: "Need Arbiter carry, will pay 10 div",
    },
    {
      title: "Full campaign carry",
      content: "I carry campaign, pay per act, 50div per act",
    },
    {
      title: "Gold Map host",
      content:
        "Castaway map host, 200% gold found tablets, 2-2.5m gold per player expected",
    },
    {
      title: "5",
      content: "221312",
    },
  ],
};
