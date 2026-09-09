import { sanityClient } from '@/infrastructure/sanity';
import type { FeaturedReviewRef } from './reviews.types';

const HOME_ID = 'home';

export class ReviewsRepository {
  async getFeaturedRefs(): Promise<FeaturedReviewRef[]> {
    const query = `*[_id == $id || _id == "drafts." + $id] | order(_updatedAt desc)[0]{
      featuredReviews[]{ _key, reviewId, listingId }
    }`;
    const doc = await sanityClient.fetch<any>(query, { id: HOME_ID });
    const items = doc?.featuredReviews || [];
    return items
      .filter((item: any) => item?.reviewId)
      .map((item: any) => ({
        _key: item._key,
        reviewId: String(item.reviewId),
        listingId: String(item.listingId || ''),
      }));
  }

  async setFeaturedRefs(items: FeaturedReviewRef[]): Promise<FeaturedReviewRef[]> {
    const payload = items.map((item, index) => ({
      _type: 'featuredReviewRef',
      _key: item._key || `fr${item.reviewId}${index}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 64),
      reviewId: item.reviewId,
      listingId: item.listingId || '',
    }));

    try {
      await sanityClient.patch(HOME_ID).set({ featuredReviews: payload }).commit();
    } catch (error) {
      // If published doc missing, try draft id
      console.warn('Patch home failed, trying drafts.home:', error);
      await sanityClient.patch(`drafts.${HOME_ID}`).set({ featuredReviews: payload }).commit();
    }

    return this.getFeaturedRefs();
  }
}