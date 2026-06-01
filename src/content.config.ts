import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(["ar", "en"]),
    date: z.coerce.date(),
    category: z.string().optional(),
    readingTime: z.string().optional(),
  }),
});

export const collections = { articles };
