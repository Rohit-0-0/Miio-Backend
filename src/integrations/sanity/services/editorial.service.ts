import type { EditorialRepository } from '../repositories/editorial.repository';
import { SanityEditorialRepository } from '../repositories/sanity-editorial.repository';

export class EditorialService {
  private repository: EditorialRepository;

  constructor() {
    // In a real DI container this would be injected.
    // For now, we instantiate the Sanity implementation.
    this.repository = new SanityEditorialRepository();
  }

  async getSiteSettings() {
    return this.repository.getSiteSettings();
  }

  async getNavigation() {
    return this.repository.getNavigation();
  }

  async getFooter() {
    return this.repository.getFooter();
  }

  async getHome() {
    return this.repository.getHome();
  }

  async getAbout() {
    return this.repository.getAbout();
  }

  async getJournal(slug: string) {
    return this.repository.getJournal(slug);
  }

  async getLocation(slug: string) {
    return this.repository.getLocation(slug);
  }

  async getLocations() {
    return this.repository.getLocations();
  }

  async getJournalPage() {
    return this.repository.getJournalPage();
  }

  async getLocationsPage() {
    return this.repository.getLocationsPage();
  }

  async getPropertyEditorial(guestyListingId: string) {
    return this.repository.getPropertyEditorial(guestyListingId);
  }
}
