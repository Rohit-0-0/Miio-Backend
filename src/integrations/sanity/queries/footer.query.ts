export const footerQuery = `*[_type == "footer" && !(_id in path("drafts.**"))][0]`;
