import { HomepageRepository } from './homepage.repository';
import type { 
  HomepageData, 
  HomepageDocument,
  HeroSection,
  FeaturedPropertiesSection,
  WhyMiioSection,
  ExperiencesSection,
  TestimonialsSection,
  FaqSection,
  NewsletterSection,
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
      return existing;
    }
    
    // Seed a default document with placeholder hero content.
    const defaultDoc: HomepageData = {
      version: 1,
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

  async updateWhyMiio(data: Partial<WhyMiioSection>, updatedBy?: string) {
    return this.updateSection('whyMiio', data as any, updatedBy);
  }

  async updateExperiences(data: Partial<ExperiencesSection>, updatedBy?: string) {
    return this.updateSection('experiences', data as any, updatedBy);
  }

  async updateTestimonials(data: Partial<TestimonialsSection>, updatedBy?: string) {
    return this.updateSection('testimonials', data as any, updatedBy);
  }

  async updateFaq(data: Partial<FaqSection>, updatedBy?: string) {
    return this.updateSection('faq', data as any, updatedBy);
  }

  async updateNewsletter(data: Partial<NewsletterSection>, updatedBy?: string) {
    return this.updateSection('newsletter', data as any, updatedBy);
  }

  async updateSeo(data: Partial<SeoSection>, updatedBy?: string) {
    return this.updateSection('seo', data as any, updatedBy);
  }
}
