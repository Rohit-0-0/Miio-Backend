import { sanityClient } from '@/infrastructure/sanity';
import type { StaysPageDocument } from './stays-page.types';

const DOCUMENT_ID = 'staysPage';
const DOCUMENT_TYPE = 'staysPage';

export class StaysPageRepository {
  async find(): Promise<StaysPageDocument | null> {
    try {
      const doc = await sanityClient.getDocument<StaysPageDocument>(DOCUMENT_ID);
      return doc || null;
    } catch (error) {
      console.error('Failed to fetch Stays Page document from Sanity:', error);
      return null;
    }
  }

  async save(data: Omit<StaysPageDocument, '_id' | '_type'>): Promise<StaysPageDocument> {
    try {
      const doc = {
        _id: DOCUMENT_ID,
        _type: DOCUMENT_TYPE,
        ...data,
      };

      return await sanityClient.createOrReplace(doc as any);
    } catch (error) {
      console.error('Failed to save Stays Page document to Sanity:', error);
      throw error;
    }
  }
}
