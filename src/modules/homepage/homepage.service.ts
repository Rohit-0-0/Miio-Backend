import { HomepageRepository } from './homepage.repository';
import type { 
  HomepageData, 
  HomepageDocument,
  HeroSection,
  FeaturedPropertiesSection,
  SeoSection
} from './homepage.types';

import { EditorialService } from '@/integrations/sanity/services/editorial.service';
import { HomepageMapper } from './homepage.mapper';
import { ReviewsService } from '@/modules/reviews';

export class HomepageService {
  private readonly editorialService = new EditorialService();
  private readonly reviewsService = new ReviewsService();

  async getHomepage(): Promise<HomepageDocument> {
    try {
      const [sanityHome, footerData, featuredTestimonials] = await Promise.all([
        this.editorialService.getHome(),
        this.editorialService.getFooter(),
        this.reviewsService.resolveFeaturedForHomepage().catch((error) => {
          console.error('Failed to resolve featured Guesty reviews for homepage:', error);
          return [];
        }),
      ]);
      
      if (sanityHome) {
        sanityHome.footer = footerData;
        // Featured Guesty reviews override CMS testimonials for public homepage
        sanityHome.testimonials = {
          items: featuredTestimonials,
        };
      }
      
      // Filter out any dead references that Sanity returned as null
      if (sanityHome?.locations?.items) {
        sanityHome.locations.items = sanityHome.locations.items.filter((item: any) => !!item);
      }

      // If the home document doesn't have explicitly curated locations (or they are all dead references), fetch them all dynamically
      if (sanityHome && (!sanityHome.locations?.items || sanityHome.locations.items.length === 0)) {
        if (!sanityHome.locations) sanityHome.locations = {};
        sanityHome.locations.items = await this.editorialService.getLocations();
      }

      if (!sanityHome) {
        return HomepageMapper.toDto({});
      }
      return HomepageMapper.toDto(sanityHome);
    } catch (error) {
      console.error('Failed to fetch homepage from Sanity:', error);
      return HomepageMapper.toDto({});
    }
  }

}
