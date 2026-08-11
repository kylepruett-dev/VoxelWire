import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['News', 'Reviews', 'Patch Notes', 'Guides']),
    heroImage: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().optional().default(false),
    readTime: z.string().optional().default('4 min read'),
    score: z.string().optional(),
    verdictStatus: z.string().optional(),
    verdictSummary: z.string().optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    reads: z.number().optional().default(0),
    author: z.union([
      z.string(),
      z.object({
        name: z.string().default('Ethan Clarke'),
        avatar: z.string().optional().default('/images/ethan-clarke.jpg'),
        role: z.string().optional().default('Editor')
      })
    ]).optional().default('Ethan Clarke')
  }),
});

export const collections = {
  articles,
};
