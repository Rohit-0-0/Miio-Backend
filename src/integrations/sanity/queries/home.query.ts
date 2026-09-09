export const homeQuery = `*[_type == "home" && !(_id in path("drafts.**"))][0] {
  ...,
  hero {
    ...,
    images[] {
      ...,
      asset->
    }
  },
  locations {
    ...,
    items[]-> {
      _id,
      title,
      description,
      "slug": slug.current,
      heroImage {
        ...,
        asset->
      }
    }
  },
  benefits {
    backgroundImage {
      ...,
      asset->
    },
    items[] {
      icon,
      title,
      description,
      iconImage {
        ...,
        asset->
      }
    }
  },
  featuredReviews[]{
    _key,
    reviewId,
    listingId
  }
}`;