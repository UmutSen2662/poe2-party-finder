import { relations } from "drizzle-orm/relations";
import { account, party, league, category, currency, rating, badge, badgeCategory, earns, applies } from "./schema";

export const partyRelations = relations(party, ({one, many}) => ({
	account: one(account, {
		fields: [party.hostId],
		references: [account.id]
	}),
	league: one(league, {
		fields: [party.leagueId],
		references: [league.id]
	}),
	category: one(category, {
		fields: [party.categoryId],
		references: [category.id]
	}),
	currency: one(currency, {
		fields: [party.currencyId],
		references: [currency.id]
	}),
	ratings: many(rating),
	applies: many(applies),
}));

export const accountRelations = relations(account, ({many}) => ({
	parties: many(party),
	ratings_giverId: many(rating, {
		relationName: "rating_giverId_account_id"
	}),
	ratings_receiverId: many(rating, {
		relationName: "rating_receiverId_account_id"
	}),
	earns: many(earns),
	applies: many(applies),
}));

export const leagueRelations = relations(league, ({many}) => ({
	parties: many(party),
}));

export const categoryRelations = relations(category, ({many}) => ({
	parties: many(party),
	badgeCategories: many(badgeCategory),
}));

export const currencyRelations = relations(currency, ({many}) => ({
	parties: many(party),
}));

export const ratingRelations = relations(rating, ({one}) => ({
	account_giverId: one(account, {
		fields: [rating.giverId],
		references: [account.id],
		relationName: "rating_giverId_account_id"
	}),
	account_receiverId: one(account, {
		fields: [rating.receiverId],
		references: [account.id],
		relationName: "rating_receiverId_account_id"
	}),
	party: one(party, {
		fields: [rating.partyId],
		references: [party.id]
	}),
}));

export const badgeCategoryRelations = relations(badgeCategory, ({one}) => ({
	badge: one(badge, {
		fields: [badgeCategory.badgeId],
		references: [badge.id]
	}),
	category: one(category, {
		fields: [badgeCategory.categoryId],
		references: [category.id]
	}),
}));

export const badgeRelations = relations(badge, ({many}) => ({
	badgeCategories: many(badgeCategory),
	earns: many(earns),
}));

export const earnsRelations = relations(earns, ({one}) => ({
	account: one(account, {
		fields: [earns.accountId],
		references: [account.id]
	}),
	badge: one(badge, {
		fields: [earns.badgeId],
		references: [badge.id]
	}),
}));

export const appliesRelations = relations(applies, ({one}) => ({
	account: one(account, {
		fields: [applies.accountId],
		references: [account.id]
	}),
	party: one(party, {
		fields: [applies.partyId],
		references: [party.id]
	}),
}));