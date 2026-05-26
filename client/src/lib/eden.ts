import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@poe2-party-finder/server/src/index";

export const API_BASE_URL = "http://localhost:3000";

export const api = edenTreaty<App>(API_BASE_URL);

/**
 * Resolves a server-provided asset path (e.g. `/categories/images/foo.png`)
 * to an absolute URL. Absolute URLs and `null`/`undefined` pass through.
 */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
