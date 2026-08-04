import { PropertyEditorialRepository } from './property-editorial.repository';
import type { PropertyEditorialData } from './property-editorial.types';
import { DEFAULT_PROPERTY_EDITORIAL } from './property-editorial.types';

export class PropertyEditorialService {
  private readonly repo = new PropertyEditorialRepository();

  async getEditorial(guestyListingId: string): Promise<PropertyEditorialData> {
    const doc = await this.repo.findByGuestyId(guestyListingId);
    if (!doc) {
      return {
        ...DEFAULT_PROPERTY_EDITORIAL,
        guestyListingId,
      };
    }
    return doc;
  }

  async updateEditorial(guestyListingId: string, data: Partial<PropertyEditorialData>): Promise<PropertyEditorialData> {
    const updated = await this.repo.save(guestyListingId, data);
    return updated;
  }
}
