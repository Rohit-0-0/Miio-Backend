import type { EditorialRepository } from './editorial.repository';
import { sanityClient } from '../client/sanity.client';
import { aboutQuery } from '../queries/about.query';
import { homeQuery } from '../queries/home.query';
import { propertyEditorialQuery } from '../queries/propertyEditorial.query';
import { journalQuery } from '../queries/journal.query';
import { siteSettingsQuery } from '../queries/siteSettings.query';
import { navigationQuery } from '../queries/navigation.query';
import { footerQuery } from '../queries/footer.query';
import { journalPageQuery, locationsPageQuery } from '../queries/pages.query';

export class SanityEditorialRepository implements EditorialRepository {
  async getSiteSettings(): Promise<any> {
    return sanityClient.fetch(siteSettingsQuery);
  }

  async getNavigation(): Promise<any> {
    return sanityClient.fetch(navigationQuery);
  }

  async getFooter(): Promise<any> {
    return sanityClient.fetch(footerQuery);
  }

  async getHome(): Promise<any> {
    return sanityClient.fetch(homeQuery);
  }

  async getAbout(): Promise<any> {
    return sanityClient.fetch(aboutQuery);
  }

  async getJournal(slug: string): Promise<any> {
    return sanityClient.fetch(journalQuery, { slug });
  }

  async getLocation(slug: string): Promise<any> {
    const { locationQuery } = await import('../queries/location.query');
    return sanityClient.fetch(locationQuery, { slug });
  }

  async getLocations(): Promise<any> {
    const { allLocationsQuery } = await import('../queries/location.query');
    return sanityClient.fetch(allLocationsQuery);
  }

  async getJournalPage(): Promise<any> {
    return sanityClient.fetch(journalPageQuery);
  }

  async getLocationsPage(): Promise<any> {
    return sanityClient.fetch(locationsPageQuery);
  }

  async getPropertyEditorial(guestyListingId: string): Promise<any> {
    return sanityClient.fetch(propertyEditorialQuery, { guestyListingId });
  }
}
