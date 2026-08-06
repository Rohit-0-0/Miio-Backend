export interface GuestyListingsQuery {
  city?: string;
  limit?: number;
  skip?: number;
  availability?: {
    checkIn: string;
    checkOut: string;
    minOccupancy?: number;
  };
}

export interface GuestyListingDto {
  _id: string;
  title: string;
  nickname?: string;
  type?: string;
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
