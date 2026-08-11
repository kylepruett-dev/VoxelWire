import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles');

  // Sort articles by publication date (newest first)
  const sortedArticles = articles.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  return rss({
    title: 'VoxelWire — Next-Gen Gaming & Tech News',
    description: 'The latest gaming news, hardware reviews, deep-dive benchmarks, and patch notes on VoxelWire.',
    site: context.site?.href || 'https://voxelwire.vercel.app',
    items: sortedArticles.map((article) => ({
      title: article.data.title,
      pubDate: new Date(article.data.pubDate),
      description: article.data.description,
      link: `/article/${article.id}`,
      customData: `<category>${article.data.category}</category>`
    })),
    customData: `<language>en-us</language>`,
  });
}
