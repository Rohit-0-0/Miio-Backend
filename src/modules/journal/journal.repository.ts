import { sanityClient } from '@/infrastructure/sanity';
import type { JournalDocument } from './journal.types';
import type { ListJournalQuery } from './journal.validation';
import { JOURNAL_DOCUMENT } from './constants';
import { buildPaginationQuery } from '@/shared/utils';

const SORT_FIELDS = {
  publishedAt: 'publishedAt',
  createdAt: '_createdAt',
  updatedAt: '_updatedAt',
  title: 'title',
} as const;

export class JournalRepository {
  private buildFilters(params: ListJournalQuery): { filters: string[], queryParams: Record<string, unknown> } {
    const filters = [`_type == "${JOURNAL_DOCUMENT.TYPE}" && !(_id in path("drafts.**"))`];
    const queryParams: Record<string, unknown> = {};

    if (params.category) {
      filters.push(`category == $category`);
      queryParams['category'] = params.category;
    }

    // status is handled by Sanity drafts logic natively

    if (params.featured !== undefined) {
      filters.push(`featured == $featured`);
      queryParams['featured'] = params.featured;
    }

    if (params.author) {
      filters.push(`author == $author`);
      queryParams['author'] = params.author;
    }

    if (params.search) {
      const searchTerms = params.search.toLowerCase().replace(/"/g, '');
      filters.push(`(
        title match $searchMatch || 
        excerpt match $searchMatch || 
        content match $searchMatch || 
        author match $searchMatch ||
        category match $searchMatch ||
        $searchExact in tags
      )`);
      queryParams['searchMatch'] = `*${searchTerms}*`;
      queryParams['searchExact'] = searchTerms;
    }

    return { filters, queryParams };
  }

  async findAll(params: ListJournalQuery): Promise<{ items: JournalDocument[]; total: number }> {
    const { filters, queryParams } = this.buildFilters(params);
    const filterString = filters.join(' && ');
    const rawSort = params.sort || 'publishedAt';
    const sortField = SORT_FIELDS[rawSort as keyof typeof SORT_FIELDS] || SORT_FIELDS.publishedAt;
    const sortOrder = params.order === 'asc' ? 'asc' : 'desc';
    const { start, end } = buildPaginationQuery(params);

    const query = `{
      "items": *[${filterString}] | order(${sortField} ${sortOrder}) [$start...$end],
      "total": count(*[${filterString}])
    }`;

    return sanityClient.fetch(query, { ...queryParams, start, end });
  }

  async findById(id: string): Promise<JournalDocument | null> {
    const query = `*[_type == "${JOURNAL_DOCUMENT.TYPE}" && !(_id in path("drafts.**")) && _id == $id][0]`;
    return sanityClient.fetch(query, { id });
  }

  async findBySlug(slug: string): Promise<JournalDocument | null> {
    const query = `*[_type == "${JOURNAL_DOCUMENT.TYPE}" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
      ...,
      "relatedProperty": coalesce(
        relatedProperty->,
        *[_type == "propertyEditorial" && ^._id in relatedJournals[]._ref][0]
      )
    }`;
    return sanityClient.fetch(query, { slug });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const query = `count(*[_type == "${JOURNAL_DOCUMENT.TYPE}" && !(_id in path("drafts.**")) && slug.current == $slug]) > 0`;
    return sanityClient.fetch(query, { slug });
  }

  async existsByTitle(title: string): Promise<boolean> {
    const query = `count(*[_type == "${JOURNAL_DOCUMENT.TYPE}" && !(_id in path("drafts.**")) && lower(title) == $title]) > 0`;
    return sanityClient.fetch(query, { title: title.toLowerCase() });
  }

  async create(data: Omit<JournalDocument, '_id' | '_type' | '_createdAt' | '_updatedAt'>): Promise<JournalDocument> {
    return sanityClient.create({
      _type: JOURNAL_DOCUMENT.TYPE,
      ...data,
    });
  }

  async update(id: string, data: Partial<Omit<JournalDocument, '_id' | '_type' | '_createdAt' | '_updatedAt'>>): Promise<JournalDocument> {
    return sanityClient.patch(id).set(data).commit();
  }

  async delete(id: string): Promise<void> {
    await sanityClient.delete(id);
  }
}
