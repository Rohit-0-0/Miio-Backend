import { PropertyRepository } from './property.repository';
import type { CreatePropertyInput, ListPropertyQuery, UpdatePropertyInput } from './property.validation';
import { generateBaseSlug } from '@/shared/utils';
import { PropertyEditorialService } from './editorial/property-editorial.service';
import type { PropertyData, PropertySummary } from './property.types';
import { GuestyProvider } from '@/integrations/guesty';
import { PropertyMapper } from './property.mapper';
import { PropertyQueryMapper } from './property-query.mapper';

export class PropertyService {
  private readonly repo = new PropertyRepository();
  private readonly editorialService = new PropertyEditorialService();
  private readonly guestyProvider = new GuestyProvider();

  private async enrichWithEditorial(property: PropertyData | null): Promise<PropertyData | null> {
    if (!property) return null;
    
    // We use guestyId as the guestyListingId mapping, but fallback to property.id if undefined.
    const guestyListingId = property.guestyId || property.id;
    const editorial = await this.editorialService.getEditorial(guestyListingId);
    
    return {
      ...property,
      editorial
    };
  }

  async getProperties(query: ListPropertyQuery) {
    // 1. Translate domain query to Guesty API query
    const guestyQuery = PropertyQueryMapper.toGuestyListingsQuery(query);
    
    // 2. Fetch raw DTOs via generic Provider
    const response = await this.guestyProvider.getListings(guestyQuery);
    
    // 3. Map raw Guesty DTOs to internal PropertySummary model
    const items: PropertySummary[] = response.results.map(dto => PropertyMapper.toPropertySummary(dto));
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    return {
      data: items,
      pagination: {
        page,
        limit,
        total: response.count,
        totalPages: Math.ceil(response.count / limit),
      },
    };
  }

  async getProperty(id: string) {
    const property = await this.repo.findById(id);
    return this.enrichWithEditorial(property);
  }

  async getPropertiesByIds(ids: string[]) {
    const properties = await this.repo.findByIds(ids);
    return Promise.all(properties.map(async p => await this.enrichWithEditorial(p) as PropertyData));
  }

  async getPropertyBySlug(slug: string) {
    const property = await this.repo.findBySlug(slug);
    return this.enrichWithEditorial(property);
  }

  async createProperty(data: CreatePropertyInput) {
    // Determine slug
    let slug = data.slug;
    if (!slug || slug.trim() === '') {
      slug = generateBaseSlug(data.title);
    }
    
    // Ensure uniqueness
    const exists = await this.repo.existsBySlug(slug);
    if (exists) {
      throw new Error(`Property with slug '${slug}' already exists`);
    }

    return this.repo.create({
      ...data,
      slug,
    } as any);
  }

  async updateProperty(id: string, data: UpdatePropertyInput) {
    if (data.slug) {
      const exists = await this.repo.existsBySlug(data.slug, id);
      if (exists) {
        throw new Error(`Property with slug '${data.slug}' already exists`);
      }
    }
    
    return this.repo.update(id, data as any);
  }

  async deleteProperty(id: string) {
    return this.repo.softDelete(id);
  }
}
