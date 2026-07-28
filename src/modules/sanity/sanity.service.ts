import { sanityClient } from '@/infrastructure/sanity';

export class SanityService {
  async testConnection() {
    return sanityClient.fetch('*');
  }
}