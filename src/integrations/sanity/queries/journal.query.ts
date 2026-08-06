export const journalQuery = `*[_type == "journal" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
  ...,
  relatedProperties[]->,
  relatedLocations[]->
}`;
