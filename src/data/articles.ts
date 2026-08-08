export type Category = 'News' | 'Reviews' | 'Patch Notes' | 'Guides';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: Category;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  score?: string;
  tags: string[];
  reads?: number;
  pubDateRaw?: Date;
}
