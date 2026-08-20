import { sanityClient } from '@/infrastructure/sanity/client';
import type { PropertyEditorialDocument, PropertyEditorialData } from './property-editorial.types';

export class PropertyEditorialRepository {
  private readonly documentType = 'propertyEditorial';

  async findByGuestyId(guestyListingId: string): Promise<PropertyEditorialDocument | null> {
    try {
      // Get the document matching the guestyListingId. 
      // Natively supports Sanity drafts via the configured client or queries (prefer published, but draft if authenticated context applies)
      // Usually the backend client is authenticated so we just fetch the document.
      const query = `*[_type == $type && guestyListingId == $id][0] {
        ...,
        "faqReferences": faqReferences[]->,
        "relatedJournals": relatedJournals[]->
      }`;
      const doc = await sanityClient.fetch<PropertyEditorialDocument>(query, { 
        type: this.documentType, 
        id: guestyListingId 
      });
      return doc || null;
    } catch (error) {
      console.error(`Failed to fetch Property Editorial for ${guestyListingId}:`, error);
      return null;
    }
  }

  async save(guestyListingId: string, data: Partial<PropertyEditorialData>): Promise<PropertyEditorialDocument> {
    const existing = await this.findByGuestyId(guestyListingId);

    if (existing) {
      return sanityClient.patch(existing._id)
        .set(data)
        .commit();
    } else {
      const doc = {
        _type: this.documentType,
        guestyListingId,
        ...data,
      };
      return sanityClient.create(doc as any);
    }
  }
}
