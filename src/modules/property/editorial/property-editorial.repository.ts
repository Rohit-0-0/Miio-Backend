import { sanityClient } from '@/infrastructure/sanity/client';
import type {
  CancellationPolicyDocument,
  HouseRulesGroup,
  PropertyEditorialDocument,
  PropertyEditorialData,
} from './property-editorial.types';

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
        "houseRuleReferences": houseRuleReferences[]->,
        "cancellationPolicyReference": cancellationPolicyReference->,
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

  findDefaultHouseRules(): Promise<HouseRulesGroup | null> {
    return this.findDefaultDocument<HouseRulesGroup>('houseRules');
  }

  findDefaultCancellationPolicy(): Promise<CancellationPolicyDocument | null> {
    return this.findDefaultDocument<CancellationPolicyDocument>('cancellationPolicy');
  }

  private async findDefaultDocument<T>(type: string): Promise<T | null> {
    try {
      const query = `*[_type == $type && isDefault == true && !(_id in path("drafts.**"))][0]`;
      const doc = await sanityClient.fetch<T | null>(query, { type });
      return doc || null;
    } catch (error) {
      console.error(`Failed to fetch default ${type}:`, error);
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
