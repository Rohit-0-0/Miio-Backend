export const siteSettingsQuery = `*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]`;
