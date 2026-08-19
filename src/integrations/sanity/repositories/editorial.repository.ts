export interface EditorialRepository {
  getSiteSettings(): Promise<any>;
  getNavigation(): Promise<any>;
  getFooter(): Promise<any>;
  getHome(): Promise<any>;
  getAbout(): Promise<any>;
  getJournal(slug: string): Promise<any>;
  getLocation(slug: string): Promise<any>;
  getLocations(): Promise<any>;
  getJournalPage(): Promise<any>;
  getLocationsPage(): Promise<any>;
  getPropertyEditorial(guestyListingId: string): Promise<any>;
}
