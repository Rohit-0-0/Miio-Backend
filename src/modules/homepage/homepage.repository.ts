import { SingletonRepository } from '@/shared/persistence/singleton.repository';
import type { HomepageData, HomepageDocument } from './homepage.types';
import { HOMEPAGE_DOCUMENT } from './constants';

export class HomepageRepository extends SingletonRepository<HomepageData, HomepageDocument> {
  constructor() {
    super(HOMEPAGE_DOCUMENT.ID, HOMEPAGE_DOCUMENT.TYPE);
  }
}
