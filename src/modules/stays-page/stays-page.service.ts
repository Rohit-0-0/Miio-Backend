import { StaysPageRepository } from './stays-page.repository';
import type { 
  StaysPageData, 
  StaysPageDocument,
  GeneralSettings,
  FilterConfiguration,
  EmptyStateSettings,
  FinalCtaSettings,
  SeoSettings
} from './stays-page.types';

export class StaysPageService {
  private readonly repo = new StaysPageRepository();

  async getStaysPage(): Promise<StaysPageDocument> {
    const existing = await this.repo.find();
    if (existing) {
      if (!existing.version) {
        existing.version = 1;
      }
      
      // Temporary: Merge new sections if they don't exist
      let changed = false;
      if (!existing.general) {
        existing.general = this.getDefaultGeneral();
        changed = true;
      }
      if (!existing.filters) {
        existing.filters = this.getDefaultFilters();
        changed = true;
      }
      if (!existing.emptyState) {
        existing.emptyState = this.getDefaultEmptyState();
        changed = true;
      }
      if (!existing.finalCta) {
        existing.finalCta = this.getDefaultFinalCta();
        changed = true;
      }
      
      if (changed) {
        await this.repo.save(existing);
      }
      
      return existing;
    }
    
    // Seed a default document
    const defaultDoc: StaysPageData = {
      version: 1,
      general: this.getDefaultGeneral(),
      filters: this.getDefaultFilters(),
      emptyState: this.getDefaultEmptyState(),
      finalCta: this.getDefaultFinalCta(),
    };
    return this.repo.save(defaultDoc);
  }

  private getDefaultGeneral(): GeneralSettings {
    return {
      heading: 'All Stays',
      introText: 'Browse our carefully curated collection of homes designed for slower living.',
    };
  }

  private getDefaultFilters(): FilterConfiguration {
    return {
      showLocationFilter: true,
      showGuestsFilter: true,
      showPriceFilter: true,
      enableMapButton: true,
      defaultSort: 'recommended',
    };
  }

  private getDefaultEmptyState(): EmptyStateSettings {
    return {
      heading: 'No stays available',
      description: "We're currently updating our curated collection.",
      ctaText: 'Return Home',
      ctaLink: '/',
    };
  }

  private getDefaultFinalCta(): FinalCtaSettings {
    return {
      heading: 'A more direct way to stay',
      description: 'Book directly for the best available rates and a more seamless experience.',
      buttonText: 'Browse by location',
      buttonLink: '/locations',
    };
  }

  private async updateSection<K extends keyof StaysPageData>(
    sectionName: K, 
    data: Partial<StaysPageData[K]>, 
    updatedBy: string = 'system'
  ): Promise<StaysPageDocument> {
    const current = await this.getStaysPage();
    
    const sectionData = {
      ...((current[sectionName] as any) || {}),
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy
    };

    const updated = {
      ...current,
      version: (current.version || 1) + 1,
      [sectionName]: sectionData
    } as StaysPageData;
    
    return this.repo.save(updated);
  }

  async updateGeneral(data: Partial<GeneralSettings>, updatedBy?: string) {
    return this.updateSection('general', data, updatedBy);
  }

  async updateFilters(data: Partial<FilterConfiguration>, updatedBy?: string) {
    return this.updateSection('filters', data, updatedBy);
  }

  async updateEmptyState(data: Partial<EmptyStateSettings>, updatedBy?: string) {
    return this.updateSection('emptyState', data, updatedBy);
  }

  async updateFinalCta(data: Partial<FinalCtaSettings>, updatedBy?: string) {
    return this.updateSection('finalCta', data, updatedBy);
  }

  async updateSeo(data: Partial<SeoSettings>, updatedBy?: string) {
    return this.updateSection('seo', data, updatedBy);
  }
}
