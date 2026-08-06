import type { AboutDto } from './editorial.dto';

export class EditorialMapper {
  static toAboutDto(sanityAbout: any): AboutDto {
    return {
      hero: {
        title: sanityAbout?.hero?.title || '',
        subtitle: sanityAbout?.hero?.subtitle || '',
      },
      intro: {
        label: sanityAbout?.intro?.label || '',
        body: sanityAbout?.intro?.body || '',
      },
      story: {
        label: sanityAbout?.story?.label || '',
        heading: sanityAbout?.story?.heading || '',
        paragraphs: sanityAbout?.story?.paragraphs || [],
        founderImage: sanityAbout?.story?.founderImage?.asset?._ref || null,
        altText: sanityAbout?.story?.founderImage?.alt || '',
      },
      pullQuote: {
        text: sanityAbout?.pullQuote?.text || '',
      },
      philosophy: {
        label: sanityAbout?.philosophy?.label || '',
        heading: sanityAbout?.philosophy?.heading || '',
        paragraphs: sanityAbout?.philosophy?.paragraphs || [],
      },
      closing: {
        body: sanityAbout?.closing?.body || '',
        cta: {
          text: sanityAbout?.closing?.cta?.text || '',
          href: sanityAbout?.closing?.cta?.href || '',
          style: sanityAbout?.closing?.cta?.style || 'primary',
        },
      },
    };
  }
}
