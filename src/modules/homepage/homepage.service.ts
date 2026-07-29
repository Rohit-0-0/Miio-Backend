import { HomepageRepository } from './homepage.repository';
import type { HomepageData, HomepageDocument } from './homepage.types';

export class HomepageService {
  private readonly repo = new HomepageRepository();

  /** Get the entire homepage document. */
  async getHomepage(): Promise<HomepageDocument> {
    const existing = await this.repo.find();
    if (existing) return existing;
    // Seed a default document with placeholder hero content.
    const defaultDoc: HomepageData = {
      hero: {
        eyebrow: 'Welcome to Miio',
        title: 'Your next adventure starts here',
        subtitle: 'Explore our curated experiences',
        backgroundImage: { assetId: '' },
        backgroundAlt: 'Hero background',
        primaryCta: { label: 'Book Now', href: '#' },
      },
    };
    return this.repo.save(defaultDoc);
  }

  /** Update only the hero portion of the homepage document. */
  async updateHero(hero: Partial<HomepageData['hero']>): Promise<HomepageDocument> {
    const current = await this.getHomepage();
    const updated = {
      ...current,
      hero: { ...current.hero, ...hero },
    } as HomepageData;
    return this.repo.save(updated);
  }
}
