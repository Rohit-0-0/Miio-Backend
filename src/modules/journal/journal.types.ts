import type { Image, Seo } from '@/types';

export type JournalStatus = 'draft' | 'published' | 'archived';

export interface JournalData {
  title: string;
  slug: string;
  excerpt?: string | undefined;
  content: string;
  coverImage?: Image | undefined;
  author?: string | undefined;
  category?: string | undefined;
  tags?: string[] | undefined;
  status: JournalStatus;
  featured?: boolean | undefined;
  publishedAt?: string | undefined;
  readingTime?: number | undefined;
  seo?: Seo | undefined;
}

export interface JournalDocument extends JournalData {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
}
