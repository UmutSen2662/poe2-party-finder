declare module "@elysiajs/cors" {
  import type { AnyElysia } from "elysia";

  export function cors(...args: unknown[]): (app: AnyElysia) => AnyElysia;
}
