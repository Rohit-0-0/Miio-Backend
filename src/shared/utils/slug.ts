export function generateBaseSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(
  title: string,
  existsFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = generateBaseSlug(title);
  let slug = baseSlug;
  let count = 2;

  while (await existsFn(slug)) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}
