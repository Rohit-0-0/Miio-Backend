import type { HomepageDocument, FeaturedPropertiesMode } from './homepage.types';

export class HomepageMapper {
  static toDto(sanityHome: any): HomepageDocument {
    return {
      _id: 'homepage',
      _type: 'homepage',
      version: 1,
      hero: {
        eyebrow: sanityHome?.hero?.eyebrow || '',
        title: sanityHome?.hero?.title || '',
        subtitle: sanityHome?.hero?.subtitle || '',
        primaryCta: {
          label: sanityHome?.hero?.cta?.text || '',
          href: sanityHome?.hero?.cta?.href || '',
        },
        images: (sanityHome?.hero?.images || []).map((img: any) => ({
          _type: 'customImage',
          asset: {
            _ref: img?.asset?._ref || img?.asset?._id || '',
          }
        }))
      },
      featuredProperties: {
        title: sanityHome?.featuredEditorial?.heading || '',
        ctaText: sanityHome?.featuredEditorial?.cta?.text || '',
        ctaLink: sanityHome?.featuredEditorial?.cta?.href || '',
        displayMode: 'LATEST' as FeaturedPropertiesMode,
        maxProperties: 3,
      },
      editorialStatement: {
        heading: sanityHome?.featuredEditorial?.sideCardTitle || '',
        description: sanityHome?.featuredEditorial?.sideCardDescription || '',
      },
      locations: {
        heading: sanityHome?.locations?.heading || '',
        items: (sanityHome?.locations?.items || []).filter((item: any) => !!item).map((item: any, i: number) => ({
          id: item._id || (i + 1).toString(),
          name: item.title || '',
          description: item.description || '',
          image: item.heroImage?.asset ? {
            _type: 'customImage',
            asset: {
              _ref: item.heroImage.asset._ref || item.heroImage.asset._id || ''
            },
            alt: item.heroImage.alt || item.title || ''
          } : undefined,
          ctaText: `Explore ${item.title || 'Location'}`,
          ctaLink: item.slug ? `/locations/${item.slug}` : '',
        })),
      },
      trust: {
        heading: sanityHome?.trust?.heading || '',
        rating: sanityHome?.trust?.ratingText || '',
        reviewCount: sanityHome?.trust?.reviewText || '',
        verifiedText: sanityHome?.trust?.verifiedText || '',
        items: (sanityHome?.trust?.features || []).map((feature: string, i: number) => ({
          id: (i + 1).toString(),
          title: feature || '',
        })),
      },
      journal: {
        heading: sanityHome?.journal?.heading || '',
        ctaText: sanityHome?.journal?.cta?.text || '',
        ctaLink: sanityHome?.journal?.cta?.href || '',
      },
      finalCta: {
        heading: sanityHome?.finalCta?.heading || '',
        description: sanityHome?.finalCta?.description || '',
        buttonText: sanityHome?.finalCta?.cta?.text || '',
        buttonLink: sanityHome?.finalCta?.cta?.href || '',
      },
    };
  }
}
