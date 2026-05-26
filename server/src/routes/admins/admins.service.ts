import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { admins } from "../../db/schema";
import { DatabaseError, NotFoundError } from "../../lib/errors";

type AdminRecord = typeof admins.$inferSelect;

const toAdminRow = (admin: AdminRecord) => ({
  id: admin.id,
  email: admin.email,
  password: admin.password,
  permissions: admin.permissions,
});

export const getAllAdmins = async () => {
  try {
    const rows = await db.select().from(admins).orderBy(desc(admins.id));
    return rows.map(toAdminRow);
  } catch (error) {
    console.error("Database error in getAllAdmins:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAllAdmins",
    });
    throw new DatabaseError("Failed to fetch admins");
  }
};

export const createAdmin = async (data: {
  email: string;
  password: string;
  permissions: string;
}) => {
  try {
    const [admin] = await db.insert(admins).values(data).returning();
    return toAdminRow(admin);
  } catch (error) {
    console.error("Database error in createAdmin:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "createAdmin",
      context: { email: data.email, permissions: data.permissions },
    });
    throw new DatabaseError("Failed to create admin");
  }
};

export const updateAdmin = async (
  id: number,
  data: { email?: string; password?: string; permissions?: string },
) => {
  try {
    const [admin] = await db
      .update(admins)
      .set(data)
      .where(eq(admins.id, id))
      .returning();

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    return toAdminRow(admin);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in updateAdmin:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "updateAdmin",
      context: { adminId: id },
    });
    throw new DatabaseError("Failed to update admin");
  }
};

export const deleteAdmin = async (id: number) => {
  try {
    const [admin] = await db
      .delete(admins)
      .where(eq(admins.id, id))
      .returning();

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    return toAdminRow(admin);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Database error in deleteAdmin:", {
      error: error instanceof Error ? error.message : String(error),
      operation: "deleteAdmin",
      context: { adminId: id },
    });
    throw new DatabaseError("Failed to delete admin");
  }
};
