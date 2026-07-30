import { PropertyRepository } from './property.repository';
import type { CreatePropertyInput, ListPropertyQuery, UpdatePropertyInput } from './property.validation';
import { generateBaseSlug } from '@/shared/utils';

export class PropertyService {
  private readonly repo = new PropertyRepository();

  async getProperties(query: ListPropertyQuery) {
    const result = await this.repo.findAll(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getProperty(id: string) {
    return this.repo.findById(id);
  }

  async getPropertiesByIds(ids: string[]) {
    return this.repo.findByIds(ids);
  }

  async getPropertyBySlug(slug: string) {
    return this.repo.findBySlug(slug);
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
