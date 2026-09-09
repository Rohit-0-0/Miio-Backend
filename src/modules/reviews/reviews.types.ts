export interface FeaturedReviewRef {
  _key?: string;
  reviewId: string;
  listingId: string;
}

export interface GuestyReviewListItem {
  id: string;
  listingId: string;
  quote: string;
  author: string;
  date: string;
  source: string;
  rating: number;
  createdAt?: string;
  featured: boolean;
}

export interface ReviewsListResult {
  items: GuestyReviewListItem[];
  count: number;
  limit: number;
  skip: number;
}

export interface HomepageTestimonialItem {
  quote: string;
  author: string;
  date?: string;
  location?: string;
  source?: string;
  rating?: number;
}