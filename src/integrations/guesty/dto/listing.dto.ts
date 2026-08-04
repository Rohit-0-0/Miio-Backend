export interface GuestyListingsQuery {
  limit?: number;
  skip?: number;
}

export interface GuestyListingDto {
  _id: string;
  title: string;
  propertyType: string;
  roomType?: string;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  accommodates: number;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
    lat?: number;
    lng?: number;
    full?: string;
  };
  pictures: Array<{
    _id: string;
    original: string;
    thumbnail: string;
    caption?: string;
  }>;
  amenities: string[];
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    neighborhood?: string;
    notes?: string;
    houseRules?: string;
  };
  active: boolean;
  isListed: boolean;
}

export interface GuestyListingsResponse {
  results: GuestyListingDto[];
  count: number;
  limit: number;
  skip: number;
}
