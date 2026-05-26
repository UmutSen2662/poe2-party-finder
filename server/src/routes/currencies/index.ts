import { Elysia, t } from "elysia";
import {
  createCurrency,
  deleteCurrency,
  getAllCurrencies,
  updateCurrency,
} from "./currencies.service";

const CurrencySchema = t.Object({
  id: t.Number(),
  name: t.String(),
  icon: t.Nullable(t.String()),
});

export const currenciesRoutes = new Elysia({ prefix: "/currencies" })
  .get("/", () => getAllCurrencies(), {
    response: t.Array(CurrencySchema),
  })
  .post("/", ({ body }) => createCurrency(body), {
    body: t.Object({
      name: t.String(),
      icon: t.Optional(t.String()),
    }),
    response: CurrencySchema,
  })
  .put("/:id", ({ params, body }) => updateCurrency(params.id, body), {
    params: t.Object({ id: t.Number() }),
    body: t.Object({
      name: t.Optional(t.String()),
      icon: t.Optional(t.String()),
    }),
    response: CurrencySchema,
  })
  .delete("/:id", ({ params }) => deleteCurrency(params.id), {
    params: t.Object({ id: t.Number() }),
    response: CurrencySchema,
  });
