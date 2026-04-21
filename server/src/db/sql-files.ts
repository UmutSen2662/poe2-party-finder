import { join } from "node:path";

export const sqlFile = (...segments: string[]) =>
  join(process.cwd(), "sql", "queries", ...segments);
