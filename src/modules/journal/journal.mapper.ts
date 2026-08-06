import { toHTML } from '@portabletext/to-html';
import type { JournalDocument, JournalData } from './journal.types';

export class JournalMapper {
  static toDto(sanityDocument: any): JournalDocument {
    // Generate excerpt from first block of content if available
    let excerpt = '';
    const contentBlocks = sanityDocument.content || [];
    const firstTextBlock = contentBlocks.find((block: any) => block._type === 'block' && block.children && block.children.length > 0);
    
    if (firstTextBlock) {
      excerpt = firstTextBlock.children
        .map((child: any) => child.text || '')
        .join('')
        .slice(0, 150);
      if (excerpt.length === 150) excerpt += '...';
    }

    // Convert portable text to HTML
    let htmlContent = '';
    try {
      if (contentBlocks.length > 0) {
        htmlContent = toHTML(contentBlocks);
      }
    } catch (error) {
      console.error('Error compiling Portable Text to HTML:', error);
    }

    // Calculate reading time (roughly 200 words per minute)
    // Extract plain text for word count
    const plainText = contentBlocks
      .filter((block: any) => block._type === 'block' && block.children)
      .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
      .join(' ');
    
    const wordCount = plainText.split(/\s+/).filter((word: string) => word.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Determine category from tags (use first tag)
    const category = sanityDocument.tags && sanityDocument.tags.length > 0 
      ? sanityDocument.tags[0] 
      : undefined;

    return {
      _id: sanityDocument._id,
      _type: sanityDocument._type,
      _createdAt: sanityDocument._createdAt,
      _updatedAt: sanityDocument._updatedAt,
      title: sanityDocument.title || '',
      slug: sanityDocument.slug?.current || '',
      excerpt,
      content: htmlContent,
      coverImage: sanityDocument.heroImage ? {
        _type: 'customImage',
        asset: sanityDocument.heroImage.asset,
        alt: sanityDocument.heroImage.alt
      } : undefined,
      author: sanityDocument.author,
      category,
      tags: sanityDocument.tags || [],
      status: sanityDocument._id?.startsWith('drafts.') ? 'draft' : 'published',
      featured: !!sanityDocument.featured,
      publishedAt: sanityDocument.publishDate,
      readingTime,
      seo: sanityDocument.seo
    } as JournalDocument;
  }
}
