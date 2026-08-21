import { getCollection, type CollectionEntry } from 'astro:content';
import type { Article } from '../data/articles';

export function formatCollectionEntry(entry: CollectionEntry<'articles'>): Article {
  const { data, id } = entry;
  const rawAuthorName = typeof data.author === 'string' ? data.author : data.author?.name;
  const isGenericEditorial = !rawAuthorName || rawAuthorName.includes('VoxelWire');

  const authorObj = {
    name: isGenericEditorial ? 'Ethan Clarke' : rawAuthorName,
    avatar: (isGenericEditorial ? '/images/ethan-clarke.jpg' : (typeof data.author === 'object' ? data.author?.avatar : null)) || '/images/ethan-clarke.jpg',
    role: (typeof data.author === 'object' ? data.author?.role : null) || 'Editor'
  };

  return {
    id: id,
    title: data.title,
    slug: id,
    excerpt: data.description,
    category: data.category,
    author: authorObj,
    publishedAt: new Date(data.pubDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    pubDateRaw: new Date(data.pubDate),
    readTime: data.readTime || '5 min read',
    imageUrl: data.heroImage || data.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    featured: data.featured,
    score: data.score,
    reads: data.reads || 0,
    tags: data.tags || []
  };
}

export async function getArticlesData() {
  const entries = await getCollection('articles');
  const allArticles = entries.map(formatCollectionEntry);
  
  // Sort articles strictly by pubDate (newest first) for front and center
  const sortedByDate = [...allArticles].sort(
    (a, b) => (b.pubDateRaw?.getTime() || 0) - (a.pubDateRaw?.getTime() || 0)
  );

  // Newest article front and center
  const newestFeatured = sortedByDate[0];

  // Latest updates (excluding newest featured)
  const latest = sortedByDate.filter(a => a.id !== newestFeatured?.id).slice(0, 4);

  // Trending at the bottom based on what users read most (reads count descending)
  const trendingGrid = [...allArticles]
    .filter(a => a.id !== newestFeatured?.id)
    .sort((a, b) => (b.reads || 0) - (a.reads || 0));

  return {
    featured: newestFeatured,
    latest,
    grid: trendingGrid,
    all: sortedByDate
  };
}

export async function getNewsArticles() {
  const { all } = await getArticlesData();
  // Everything that isn't a review, sorted by pubDate (newest first)
  return all
    .filter(article => article.category !== 'Reviews')
    .sort((a, b) => (b.pubDateRaw?.getTime() || 0) - (a.pubDateRaw?.getTime() || 0));
}

export async function getReviewArticles() {
  const { all } = await getArticlesData();
  // Only reviews, sorted by pubDate (newest first)
  return all
    .filter(article => article.category === 'Reviews')
    .sort((a, b) => (b.pubDateRaw?.getTime() || 0) - (a.pubDateRaw?.getTime() || 0));
}
