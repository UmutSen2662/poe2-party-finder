import type {
  account,
  admin,
  applies,
  badge,
  badgeCategory,
  category,
  currency,
  earns,
  league,
  party,
  rating,
} from "./generated/schema";

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;

export type Applies = typeof applies.$inferSelect;
export type NewApplies = typeof applies.$inferInsert;

export type Badge = typeof badge.$inferSelect;
export type NewBadge = typeof badge.$inferInsert;

export type BadgeCategory = typeof badgeCategory.$inferSelect;
export type NewBadgeCategory = typeof badgeCategory.$inferInsert;

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export type Currency = typeof currency.$inferSelect;
export type NewCurrency = typeof currency.$inferInsert;

export type Earns = typeof earns.$inferSelect;
export type NewEarns = typeof earns.$inferInsert;

export type League = typeof league.$inferSelect;
export type NewLeague = typeof league.$inferInsert;

export type Party = typeof party.$inferSelect;
export type NewParty = typeof party.$inferInsert;

export type Rating = typeof rating.$inferSelect;
export type NewRating = typeof rating.$inferInsert;
