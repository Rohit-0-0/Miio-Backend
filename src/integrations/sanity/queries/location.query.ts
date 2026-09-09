export const locationQuery = `*[_type == "location" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  title,
  "slug": slug.current,
  guestyCity,
  heroImage {
    ...,
    asset->
  },
  description,
  highlights[] {
    _key,
    text,
    icon {
      ...,
      asset->
    }
  },
  localGuideHeading,
  localGuideItems[] {
    _key,
    title,
    description,
    image {
      ...,
      asset->
    }
  },
  relatedJournalsCta,
  nearbyJournals[]-> {
    _id,
    title,
    "slug": slug.current,
    featured,
    publishDate,
    author,
    excerpt,
    heroImage {
      ...,
      asset->
    }
  },
  finalCta {
    heading,
    description,
    buttonText,
    buttonLink
  },
  seo {
    title,
    description
  }
}`;

export const allLocationsQuery = `*[_type == "location" && !(_id in path("drafts.**"))] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  heroImage {
    ...,
    asset->
  },
  description
}`;