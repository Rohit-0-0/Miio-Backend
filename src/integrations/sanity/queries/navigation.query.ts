export const navigationQuery = `*[_type == "navigation" && !(_id in path("drafts.**"))][0]`;
