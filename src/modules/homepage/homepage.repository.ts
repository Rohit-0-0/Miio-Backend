import { SingletonRepository } from '@/shared/persistence/singleton.repository';
import type { HomepageData, HomepageDocument } from './homepage.types';
import { HOMEPAGE_DOCUMENT } from './constants';
import { sanityClient } from '@/infrastructure/sanity';

export class HomepageRepository extends SingletonRepository<HomepageData, HomepageDocument> {
  constructor() {
    super(HOMEPAGE_DOCUMENT.ID, HOMEPAGE_DOCUMENT.TYPE);
  }

  override async find(): Promise<HomepageDocument | null> {
    const query = `*[_id == $id][0] {
      ...,
      featuredEditorial {
        ...,
        manualSelection[]->{
          _id,
          guestyListingId
        }
      }
    }`;
    const result = await sanityClient.fetch(query, { id: this.documentId });
    return result as HomepageDocument | null;
  }
}
