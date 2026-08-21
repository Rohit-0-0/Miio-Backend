export interface GuestyReviewDto {
  _id: string;
  listingId: string;
  reviewerId: string;
  publicReview: string;
  reviewer: {
    firstName: string;
    lastName: string;
    pictureUrl: string;
  };
  overallRating: number;
  createdAt: string;
}

export interface GuestyReviewsResponse {
  results: GuestyReviewDto[];
  count: number;
}
