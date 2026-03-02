import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@poe2-party-finder/server/src/index";

export const api = edenTreaty<App>("http://localhost:3000");
