import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { currencies } from "../../db/schema";
import { DatabaseError, NotFoundError } from "../../lib/errors";

type CurrencyRecord = typeof currencies.$inferSelect;

export interface CurrencyRow {
  id: number;
  name: string;
  icon: string | null;
}

const toCurrencyRow = (currency: CurrencyRecord): CurrencyRow => ({
  id: currency.id,
  name: currency.name,
  icon: currency.icon,
});

export const getAllCurrencies = async (): Promise<CurrencyRow[]> => {
  try {
    const rows = await db
      .select()
      .from(currencies)
      .orderBy(desc(currencies.id));
    return rows.map(toCurrencyRow);
  } catch (error) {
    console.error("Database error in getAllCurrencies:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllCurrencies",
    });
    throw new DatabaseError("Failed to fetch currencies");
  }
};

export const createCurrency = async (data: {
  name: string;
  icon?: string;
}): Promise<CurrencyRow> => {
  try {
    const [currency] = await db
      .insert(currencies)
      .values({ name: data.name, icon: data.icon ?? null })
      .returning();

    return toCurrencyRow(currency);
  } catch (error) {
    console.error("Database error in createCurrency:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createCurrency",
      context: { name: data.name },
    });
    throw new DatabaseError("Failed to create currency");
  }
};

export const updateCurrency = async (
  id: number,
  data: { name?: string; icon?: string },
): Promise<CurrencyRow> => {
  try {
    const updateData: Partial<typeof currencies.$inferInsert> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }

    const [currency] = await db
      .update(currencies)
      .set(updateData)
      .where(eq(currencies.id, id))
      .returning();

    if (!currency) {
      throw new NotFoundError("Currency not found");
    }

    return toCurrencyRow(currency);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in updateCurrency:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "updateCurrency",
      context: { currencyId: id },
    });
    throw new DatabaseError("Failed to update currency");
  }
};

export const deleteCurrency = async (id: number): Promise<CurrencyRow> => {
  try {
    const [currency] = await db
      .delete(currencies)
      .where(eq(currencies.id, id))
      .returning();

    if (!currency) {
      throw new NotFoundError("Currency not found");
    }

    return toCurrencyRow(currency);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in deleteCurrency:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "deleteCurrency",
      context: { currencyId: id },
    });
    throw new DatabaseError("Failed to delete currency");
  }
};
