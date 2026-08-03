import { HomepageRepository } from './homepage.repository';
import type { 
  HomepageData, 
  HomepageDocument,
  HeroSection,
  FeaturedPropertiesSection,
  SeoSection
} from './homepage.types';

export class HomepageService {
  private readonly repo = new HomepageRepository();

  async getHomepage(): Promise<HomepageDocument> {
    const existing = await this.repo.find();
    if (existing) {
      if (!existing.version) {
        existing.version = 1;
      }
      
      // Temporary: Merge new sections if they don't exist
      let changed = false;
      if (!existing.editorialStatement) {
        existing.editorialStatement = {
          heading: 'A curated collection of homes that feel like a retreat.',
          description: 'We believe that travel should be more than just a place to sleep. It should be an experience that grounds you. Our properties are hand-picked for their unique character, premium design, and ability to connect you with the essentials of living well.',
        };
        changed = true;
      }
      if (!existing.locations || existing.locations.items?.[0]?.name === 'Tuscany, Italy') {
        existing.locations = {
          heading: 'Discover Our Locations',
          items: [
            { id: '1', name: 'Bondi', description: 'Sun-drenched beaches and vibrant coastal living.' },
            { id: '2', name: 'Vaucluse', description: 'Exclusive harbor views and tranquil luxury.' },
            { id: '3', name: 'Paddington', description: 'Heritage charm meets boutique elegance.' },
          ],
        };
        changed = true;
      }
      if (!existing.trust) {
        existing.trust = {
          heading: 'The Miio Standard',
          rating: '4.9',
          reviewCount: '200+',
          verifiedText: 'Verified Stays',
          items: [
            { id: '1', title: 'Premium Design', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
            { id: '2', title: 'Curated Amenities', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
            { id: '3', title: '24/7 Concierge', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
          ],
        };
        changed = true;
      }
      if (!existing.journal) {
        existing.journal = {
          heading: 'The Journal',
          ctaText: 'View All Articles',
          ctaLink: '/journal',
        };
        changed = true;
      }
      if (!existing.finalCta) {
        existing.finalCta = {
          heading: 'Ready for your next retreat?',
          description: 'Explore our hand-picked collection of premium stays and experience the Miio standard for yourself.',
          buttonText: 'Book a Stay',
          buttonLink: '/properties',
        };
        changed = true;
      }
      
      if (changed) {
        await this.repo.save(existing);
      }
      
      return existing;
    }
    
    // Seed a default document with placeholder hero content.
    const defaultDoc: HomepageData = {
      version: 1,
      hero: {
        eyebrow: 'Welcome to Miio',
        title: 'Spaces designed for slow mornings...',
        subtitle: 'Experience the perfect blend of luxury, comfort, and thoughtful design in our curated properties.',
        backgroundImage: { assetId: '' },
        backgroundAlt: 'Hero background',
        primaryCta: { label: 'Explore Stays', href: '/properties' },
      },
      editorialStatement: {
        heading: 'A curated collection of homes that feel like a retreat.',
        description: 'We believe that travel should be more than just a place to sleep. It should be an experience that grounds you. Our properties are hand-picked for their unique character, premium design, and ability to connect you with the essentials of living well.',
      },
      locations: {
        heading: 'Discover Our Locations',
        items: [
          { id: '1', name: 'Tuscany, Italy', description: 'Rolling hills and historic villas.' },
          { id: '2', name: 'Kyoto, Japan', description: 'Serene machiyas and bamboo forests.' },
          { id: '3', name: 'Bali, Indonesia', description: 'Tropical modernism and lush jungles.' },
        ],
      },
      trust: {
        heading: 'The Miio Standard',
        rating: '4.9',
        reviewCount: '200+',
        verifiedText: 'Verified Stays',
        items: [
          { id: '1', title: 'Premium Design', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
          { id: '2', title: 'Curated Amenities', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
          { id: '3', title: '24/7 Concierge', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
        ],
      },
      journal: {
        heading: 'The Journal',
        ctaText: 'View All Articles',
        ctaLink: '/journal',
      },
      finalCta: {
        heading: 'Ready for your next retreat?',
        description: 'Explore our hand-picked collection of premium stays and experience the Miio standard for yourself.',
        buttonText: 'Book a Stay',
        buttonLink: '/properties',
      },
    };
    return this.repo.save(defaultDoc);
  }

  private async updateSection<K extends keyof HomepageData>(
    sectionName: K, 
    data: Partial<HomepageData[K]>, 
    updatedBy: string = 'system'
  ): Promise<HomepageDocument> {
    const current = await this.getHomepage();
    
    // Update metadata for the section
    const sectionData = {
      ...(current[sectionName] || {}),
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy
    };

    const updated = {
      ...current,
      version: (current.version || 1) + 1,
      [sectionName]: sectionData
    } as HomepageData;
    
    return this.repo.save(updated);
  }

  async updateHero(data: Partial<HeroSection>, updatedBy?: string) {
    return this.updateSection('hero', data as any, updatedBy);
  }

  async updateFeaturedProperties(data: Partial<FeaturedPropertiesSection>, updatedBy?: string) {
    return this.updateSection('featuredProperties', data as any, updatedBy);
  }



  async updateSeo(data: Partial<SeoSection>, updatedBy?: string) {
    return this.updateSection('seo', data as any, updatedBy);
  }

  async updateEditorialStatement(data: Partial<any>, updatedBy?: string) {
    return this.updateSection('editorialStatement', data as any, updatedBy);
  }

  async updateLocations(data: Partial<any>, updatedBy?: string) {
    return this.updateSection('locations', data as any, updatedBy);
  }

  async updateTrust(data: Partial<any>, updatedBy?: string) {
    return this.updateSection('trust', data as any, updatedBy);
  }

  async updateJournal(data: Partial<any>, updatedBy?: string) {
    return this.updateSection('journal', data as any, updatedBy);
  }

  async updateFinalCta(data: Partial<any>, updatedBy?: string) {
    return this.updateSection('finalCta', data as any, updatedBy);
  }
}
