import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  applies,
  categories,
  currencies,
  leagues,
  parties,
  players,
} from "../../db/schema";
import { DatabaseError, NotFoundError } from "../../lib/errors";
import {
  type PublicApplicationStatus,
  type PublicPartyStatus,
  toPublicApplicationStatus,
  toPublicPartyStatus,
} from "../../lib/status";

export interface ServiceTemplate {
  name: string;
  text: string;
  title?: string;
  description?: string;
  capacity?: number;
  cost?: number;
  leagueId?: number;
  categoryId?: number;
  currencyId?: number;
}

export interface LobbyStateEmpty {
  kind: "empty";
}

export interface LobbyStateCustomer {
  kind: "customer";
  application: {
    id: number;
    playerId: number;
    partyId: number;
    status: PublicApplicationStatus;
    appliedAt: Date;
    party: {
      id: number;
      title: string;
      description: string | null;
      capacity: number;
      cost: number;
      status: PublicPartyStatus;
      createdAt: Date;
      host: {
        id: number;
        ign: string;
        hostRating: number;
      } | null;
      league: {
        id: number;
        name: string;
      };
      category: {
        id: number;
        displayName: string;
        imagePath: string | null;
      };
      currency: {
        id: number;
        name: string;
        icon: string | null;
      };
    };
  };
}

export interface LobbyStateHost {
  kind: "host";
  party: {
    id: number;
    title: string;
    description: string | null;
    capacity: number;
    cost: number;
    status: PublicPartyStatus;
    createdAt: Date;
    host: {
      id: number;
      ign: string;
      hostRating: number;
    } | null;
    league: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      displayName: string;
      imagePath: string | null;
    };
    currency: {
      id: number;
      name: string;
      icon: string | null;
    };
  };
}

export type LobbyState = LobbyStateEmpty | LobbyStateCustomer | LobbyStateHost;

// Re-export types for client use
export type {
  PublicApplicationStatus,
  PublicPartyStatus,
} from "../../lib/status";

export async function getLobbyState(playerId: number): Promise<LobbyState> {
  try {
    // Check if player is hosting an active party
    const hostedParty = await db
      .select({
        id: parties.id,
        title: parties.title,
        description: parties.description,
        capacity: parties.capacity,
        cost: parties.cost,
        status: parties.status,
        createdAt: parties.createdAt,
        hostId: parties.hostId,
        leagueId: parties.leagueId,
        categoryId: parties.categoryId,
        currencyId: parties.currencyId,
        host: {
          id: players.id,
          ign: players.ign,
          hostRating: players.hostRating,
        },
        league: {
          id: leagues.id,
          name: leagues.name,
        },
        category: {
          id: categories.id,
          displayName: categories.displayName,
          imagePath: categories.imagePath,
        },
        currency: {
          id: currencies.id,
          name: currencies.name,
          icon: currencies.icon,
        },
      })
      .from(parties)
      .innerJoin(leagues, eq(parties.leagueId, leagues.id))
      .innerJoin(categories, eq(parties.categoryId, categories.id))
      .innerJoin(currencies, eq(parties.currencyId, currencies.id))
      .leftJoin(players, eq(parties.hostId, players.id))
      .where(and(eq(parties.hostId, playerId), eq(parties.status, "gathering")))
      .limit(1);

    if (hostedParty.length > 0) {
      const party = hostedParty[0];
      return {
        kind: "host",
        party: {
          id: party.id,
          title: party.title,
          description: party.description,
          capacity: party.capacity,
          cost: party.cost,
          status: toPublicPartyStatus(party.status),
          createdAt: party.createdAt,
          host: party.host
            ? {
                id: party.host.id,
                ign: party.host.ign,
                hostRating: Number(party.host.hostRating),
              }
            : null,
          league: {
            id: party.league.id,
            name: party.league.name,
          },
          category: {
            id: party.category.id,
            displayName: party.category.displayName,
            imagePath: party.category.imagePath,
          },
          currency: {
            id: party.currency.id,
            name: party.currency.name,
            icon: party.currency.icon,
          },
        },
      };
    }

    // Check if player has an active application
    const application = await db
      .select({
        playerId: applies.playerId,
        partyId: applies.partyId,
        applicationStatus: applies.status,
        appliedAt: applies.appliedAt,
        partyId2: parties.id,
        title: parties.title,
        description: parties.description,
        capacity: parties.capacity,
        cost: parties.cost,
        partyStatus: parties.status,
        createdAt: parties.createdAt,
        hostId: parties.hostId,
        leagueId: parties.leagueId,
        categoryId: parties.categoryId,
        currencyId: parties.currencyId,
        host: {
          id: players.id,
          ign: players.ign,
          hostRating: players.hostRating,
        },
        league: {
          id: leagues.id,
          name: leagues.name,
        },
        category: {
          id: categories.id,
          displayName: categories.displayName,
          imagePath: categories.imagePath,
        },
        currency: {
          id: currencies.id,
          name: currencies.name,
          icon: currencies.icon,
        },
      })
      .from(applies)
      .innerJoin(parties, eq(applies.partyId, parties.id))
      .innerJoin(leagues, eq(parties.leagueId, leagues.id))
      .innerJoin(categories, eq(parties.categoryId, categories.id))
      .innerJoin(currencies, eq(parties.currencyId, currencies.id))
      .leftJoin(players, eq(parties.hostId, players.id))
      .where(
        and(eq(applies.playerId, playerId), eq(parties.status, "gathering")),
      )
      .limit(1);

    if (application.length > 0) {
      const app = application[0];
      return {
        kind: "customer",
        application: {
          id: app.playerId, // Using composite key, but this is a simplified version
          playerId: app.playerId,
          partyId: app.partyId,
          status: toPublicApplicationStatus(app.applicationStatus),
          appliedAt: app.appliedAt,
          party: {
            id: app.partyId2,
            title: app.title,
            description: app.description,
            capacity: app.capacity,
            cost: app.cost,
            status: toPublicPartyStatus(app.partyStatus),
            createdAt: app.createdAt,
            host: app.host
              ? {
                  id: app.host.id,
                  ign: app.host.ign,
                  hostRating: Number(app.host.hostRating),
                }
              : null,
            league: {
              id: app.league.id,
              name: app.league.name,
            },
            category: {
              id: app.category.id,
              displayName: app.category.displayName,
              imagePath: app.category.imagePath,
            },
            currency: {
              id: app.currency.id,
              name: app.currency.name,
              icon: app.currency.icon,
            },
          },
        },
      };
    }

    // Player has no active party or application
    return { kind: "empty" };
  } catch (error) {
    console.error("Database error in getLobbyState:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getLobbyState",
      context: { playerId },
    });
    throw new DatabaseError("Failed to fetch lobby state");
  }
}

export async function getPlayerTemplates(playerId: number) {
  try {
    const player = await db
      .select({
        templates: players.templates,
      })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (player.length === 0) {
      throw new NotFoundError("Player not found");
    }

    return player[0].templates || [];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in getPlayerTemplates:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getPlayerTemplates",
      context: { playerId },
    });
    throw new DatabaseError("Failed to fetch player templates");
  }
}

export async function addPlayerTemplate(
  playerId: number,
  template: {
    name: string;
    text: string;
    title?: string;
    description?: string;
    capacity?: number;
    cost?: number;
    leagueId?: number;
    categoryId?: number;
    currencyId?: number;
  },
) {
  try {
    const player = await db
      .select({
        templates: players.templates,
      })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (player.length === 0) {
      throw new NotFoundError("Player not found");
    }

    const updatedTemplates = [...(player[0].templates || []), template];

    const updated = await db
      .update(players)
      .set({ templates: updatedTemplates })
      .where(eq(players.id, playerId))
      .returning();

    return updated[0].templates;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in addPlayerTemplate:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "addPlayerTemplate",
      context: { playerId, template },
    });
    throw new DatabaseError("Failed to add player template");
  }
}

export async function deletePlayerTemplate(
  playerId: number,
  templateIndex: number,
) {
  try {
    const player = await db
      .select({
        templates: players.templates,
      })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (player.length === 0) {
      throw new NotFoundError("Player not found");
    }

    const currentTemplates = player[0].templates || [];
    if (templateIndex < 0 || templateIndex >= currentTemplates.length) {
      throw new NotFoundError("Template not found");
    }

    const updatedTemplates = currentTemplates.filter(
      (_, index) => index !== templateIndex,
    );

    const updated = await db
      .update(players)
      .set({ templates: updatedTemplates })
      .where(eq(players.id, playerId))
      .returning();

    return updated[0].templates;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in deletePlayerTemplate:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "deletePlayerTemplate",
      context: { playerId, templateIndex },
    });
    throw new DatabaseError("Failed to delete player template");
  }
}
