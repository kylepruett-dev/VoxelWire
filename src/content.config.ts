import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['News', 'Reviews', 'Patch Notes', 'Guides']),
    heroImage: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().optional().default(false),
    readTime: z.string().optional().default('4 min read'),
    score: z.string().optional(),
    reads: z.number().optional().default(0),
    author: z.object({
      name: z.string().default('Ethan Clarke'),
      avatar: z.string().default('/images/ethan-clarke.jpg'),
      role: z.string().default('Editor')
    }).optional().default({
      name: 'Ethan Clarke',
      avatar: '/images/ethan-clarke.jpg',
      role: 'Editor'
    })
  }),
});

export const collections = {
  articles,
};
