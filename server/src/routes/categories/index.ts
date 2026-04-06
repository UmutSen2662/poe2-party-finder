import { mkdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { Elysia, t } from "elysia";
import { CategorySchema } from "@/db/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
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
      imagePath: t.Optional(t.String()),
    }),
  })
  .put("/:id", ({ params, body }) => updateCategory(params.id, body), {
    params: t.Object({
      id: t.Number(),
    }),
    body: t.Object({
      displayName: t.Optional(t.String()),
      imagePath: t.Optional(t.String()),
      status: t.Optional(t.Union([t.Literal("active"), t.Literal("deleted")])),
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
      const ext = file.name.split(".").pop();
      const filename = ext
        ? `${crypto.randomUUID()}.${ext}`
        : crypto.randomUUID();
      const uploadDir = process.env.UPLOAD_DIR || "./uploads";
      const imagesDir = join(uploadDir, "images");
      const path = join(imagesDir, filename);

      await mkdir(imagesDir, { recursive: true });
      await Bun.write(path, file);

      return { imagePath: `/categories/images/${filename}` };
    },
    {
      body: t.Object({
        image: t.File({
          type: "image", // only accept image/* mime types
          maxSize: "5m", // max 5MB
        }),
      }),
    },
  )
  .get(
    "/images/:filename",
    async ({ params }) => {
      if (basename(params.filename) !== params.filename) {
        throw new ValidationError("Invalid image filename");
      }

      const uploadDir = process.env.UPLOAD_DIR || "./uploads";
      const path = join(uploadDir, "images", params.filename);
      const file = Bun.file(path);

      if (!(await file.exists())) {
        throw new NotFoundError("Image not found");
      }

      return file;
    },
    {
      params: t.Object({
        filename: t.String(),
      }),
    },
  );
