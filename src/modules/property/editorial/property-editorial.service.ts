import { PropertyEditorialRepository } from './property-editorial.repository';
import type { PropertyEditorialData } from './property-editorial.types';
import { DEFAULT_PROPERTY_EDITORIAL } from './property-editorial.types';

export class PropertyEditorialService {
  private readonly repo = new PropertyEditorialRepository();

  async getEditorial(guestyListingId: string): Promise<PropertyEditorialData> {
    const doc: any = await this.repo.findByGuestyId(guestyListingId);
    if (!doc) {
      return {
        ...DEFAULT_PROPERTY_EDITORIAL,
        guestyListingId,
      };
    }
    
    // Flatten the questions from the referenced FAQ group documents
    const flattenedFaqs = (doc.faqReferences || []).flatMap((group: any) => group?.questions || []);

    // Map Sanity schema fields to expected frontend interface
    return {
      ...DEFAULT_PROPERTY_EDITORIAL,
      guestyListingId,
      description: doc.overview || '',
      experience: doc.heroStory || '',
      faq: flattenedFaqs,
      seo: doc.seo || DEFAULT_PROPERTY_EDITORIAL.seo,
      // Map other fields as needed...
      ...doc
    };
  }

  async updateEditorial(guestyListingId: string, data: Partial<PropertyEditorialData>): Promise<PropertyEditorialData> {
    const updated = await this.repo.save(guestyListingId, data);
    return updated;
  }
}
