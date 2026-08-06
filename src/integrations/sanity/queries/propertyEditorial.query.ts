export const propertyEditorialQuery = `*[_type == "propertyEditorial" && guestyListingId == $guestyListingId && !(_id in path("drafts.**"))][0]{
  ...,
  faqReferences[]->,
  relatedJournals[]->
}`;
