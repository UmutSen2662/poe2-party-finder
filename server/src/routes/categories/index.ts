import { Elysia, t } from "elysia";
import { CategorySchema } from "../../db/schema";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "./categories.service";

export const categoriesRoutes = new Elysia({ prefix: "/categories" })
  .get("/", () => getAllCategories(), {
    response: t.Array(CategorySchema),
  })
  .post("/", ({ body }) => createCategory(body), {
    body: t.Object({
      displayName: t.String(),
      imagePath: t.String(),
    }),
  })
  .put("/:id", ({ params, body }) => updateCategory(params.id, body), {
    params: t.Object({
      id: t.Number(),
    }),
    body: t.Object({
      displayName: t.String(),
      imagePath: t.String(),
    }),
  })
  .delete("/:id", ({ params }) => deleteCategory(params.id), {
    params: t.Object({
      id: t.Number(),
    }),
  })
  .get("/:id", ({ params }) => getCategoryById(params.id), {
    params: t.Object({
      id: t.Number(),
    }),
  })
  .post(
    "/upload-image",
    async ({ body }) => {
      const file = body.image;

      // Generate a unique filename
      const ext = file.name.split(".").pop();
      const filename = `${crypto.randomUUID()}.${ext}`;

      // Write to disk
      const uploadDir = process.env.UPLOAD_DIR || "./uploads";
      const path = `${uploadDir}/images/${filename}`;
      await Bun.write(path, file);

      // Return the relative path (this is what you store in the DB)
      return { imagePath: `images/${filename}` };
    },
    {
      body: t.Object({
        image: t.File({
          type: "image", // only accept image/* mime types
          maxSize: "5m", // max 5MB
        }),
      }),
    },
  );
