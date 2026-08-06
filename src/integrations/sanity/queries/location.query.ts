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
  nearbyJournals[]-> {
    _id,
    title,
    "slug": slug.current,
    featured,
    publishDate,
    heroImage {
      ...,
      asset->
    },
    excerpt
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
