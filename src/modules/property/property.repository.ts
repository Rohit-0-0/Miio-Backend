import { sanityClient } from '@/infrastructure/sanity';
import type { PropertyDocument } from './property.types';
import type { ListPropertyQuery } from './property.validation';
import { PROPERTY_DOCUMENT } from './constants';
import { buildPaginationQuery } from '@/shared/utils';

const SORT_FIELDS = {
  sortOrder: 'sortOrder',
  createdAt: '_createdAt',
  updatedAt: '_updatedAt',
  title: 'title',
} as const;

export class PropertyRepository {
  private buildFilters(params: ListPropertyQuery): { filters: string[], queryParams: Record<string, unknown> } {
    const filters = [
      `_type == "${PROPERTY_DOCUMENT.TYPE}"`,
      `!defined(deletedAt)` // Exclude soft-deleted properties
    ];
    const queryParams: Record<string, unknown> = {};

    if (params.status) {
      filters.push(`lifecycleStatus == $status`);
      queryParams['status'] = params.status;
    }

    if (params.propertyType) {
      filters.push(`propertyType == $propertyType`);
      queryParams['propertyType'] = params.propertyType;
    }

    if (params.featured !== undefined) {
      filters.push(`featured == $featured`);
      queryParams['featured'] = params.featured;
    }

    if (params.country) {
      filters.push(`(country == $country || location.country == $country)`);
      queryParams['country'] = params.country;
    }

    if (params.city) {
      filters.push(`(city == $city || location.city == $city)`);
      queryParams['city'] = params.city;
    }

    if (params.search) {
      const searchTerms = params.search.toLowerCase().replace(/"/g, '');
      filters.push(`(
        title match $searchMatch || 
        city match $searchMatch || 
        location.city match $searchMatch ||
        country match $searchMatch || 
        location.country match $searchMatch ||
        shortDescription match $searchMatch
      )`);
      queryParams['searchMatch'] = `*${searchTerms}*`;
    }

    return { filters, queryParams };
  }

  private mapDocument(doc: any): PropertyDocument | null {
    if (!doc) return null;
    
    // Backwards compatibility for location
    if (!doc.location && (doc.city || doc.state || doc.country || doc.address || doc.latitude || doc.longitude)) {
      doc.location = {
        address: doc.address || '',
        city: doc.city || '',
        state: doc.state || '',
        country: doc.country || '',
        latitude: doc.latitude || 0,
        longitude: doc.longitude || 0,
        source: 'manual',
      };
    }
    
    return doc;
  }

  async findAll(params: ListPropertyQuery): Promise<{ items: PropertyDocument[]; total: number }> {
    const { filters, queryParams } = this.buildFilters(params);
    const filterString = filters.join(' && ');
    const rawSort = params.sort || 'createdAt';
    const sortField = SORT_FIELDS[rawSort as keyof typeof SORT_FIELDS] || SORT_FIELDS.createdAt;
    const sortOrder = params.order === 'asc' ? 'asc' : 'desc';
    const { start, end } = buildPaginationQuery(params);

    const query = `{
      "items": *[${filterString}] | order(${sortField} ${sortOrder}) [$start...$end],
      "total": count(*[${filterString}])
    }`;

    const result = await sanityClient.fetch(query, { ...queryParams, start, end });
    if (result && result.items) {
      result.items = result.items.map((item: any) => this.mapDocument(item));
    }
    return result;
  }

  async findById(id: string): Promise<PropertyDocument | null> {
    const query = `*[_type == "${PROPERTY_DOCUMENT.TYPE}" && id == $id && !defined(deletedAt)][0]`;
    const doc = await sanityClient.fetch(query, { id });
    return this.mapDocument(doc);
  }

  async findByIds(ids: string[]): Promise<PropertyDocument[]> {
    if (!ids || ids.length === 0) return [];
    const query = `*[_type == "${PROPERTY_DOCUMENT.TYPE}" && id in $ids && !defined(deletedAt)]`;
    const properties: PropertyDocument[] = await sanityClient.fetch(query, { ids });
    
    // Preserve the exact order supplied in the ids array
    const idMap = new Map(properties.map(p => [p.id, this.mapDocument(p)]));
    return ids.map(id => idMap.get(id)).filter((p): p is PropertyDocument => p !== undefined);
  }

  async findBySlug(slug: string): Promise<PropertyDocument | null> {
    const query = `*[_type == "${PROPERTY_DOCUMENT.TYPE}" && slug == $slug && !defined(deletedAt)][0]`;
    const doc = await sanityClient.fetch(query, { slug });
    return this.mapDocument(doc);
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    let query = `count(*[_type == "${PROPERTY_DOCUMENT.TYPE}" && slug == $slug && !defined(deletedAt) `;
    const params: Record<string, unknown> = { slug };
    
    if (excludeId) {
      query += ` && id != $excludeId`;
      params['excludeId'] = excludeId;
    }
    query += `]) > 0`;

    return sanityClient.fetch(query, params);
  }

  async create(data: Omit<PropertyDocument, '_id' | '_type' | '_createdAt' | '_updatedAt'>): Promise<PropertyDocument> {
    return sanityClient.create({
      _type: PROPERTY_DOCUMENT.TYPE,
      ...data,
    });
  }

  async update(id: string, data: Partial<Omit<PropertyDocument, '_id' | '_type' | '_createdAt' | '_updatedAt'>>): Promise<PropertyDocument> {
    // Find internal Sanity _id from stable id
    const doc = await this.findById(id);
    if (!doc) throw new Error('Property not found');

    return sanityClient.patch(doc._id).set(data).commit();
  }

  async softDelete(id: string): Promise<PropertyDocument> {
    const doc = await this.findById(id);
    if (!doc) throw new Error('Property not found');

    return sanityClient.patch(doc._id).set({ deletedAt: new Date().toISOString() }).commit();
  }
}
