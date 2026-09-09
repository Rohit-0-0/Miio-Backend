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
        })),
        searchWidgetLabels: sanityHome?.hero?.searchWidgetLabels ? {
          whereTo: sanityHome.hero.searchWidgetLabels.whereTo,
          chooseLocation: sanityHome.hero.searchWidgetLabels.chooseLocation,
          dates: sanityHome.hero.searchWidgetLabels.dates,
          addDates: sanityHome.hero.searchWidgetLabels.addDates,
          guests: sanityHome.hero.searchWidgetLabels.guests,
          addGuests: sanityHome.hero.searchWidgetLabels.addGuests,
          searchButton: sanityHome.hero.searchWidgetLabels.searchButton
        } : undefined
      },
      featuredProperties: {
        title: sanityHome?.featuredEditorial?.heading || '',
        ctaText: sanityHome?.featuredEditorial?.cta?.text || '',
        ctaLink: sanityHome?.featuredEditorial?.cta?.href || '',
        displayMode: sanityHome?.featuredEditorial?.displayMode || ('LATEST' as FeaturedPropertiesMode),
        maxProperties: sanityHome?.featuredEditorial?.maxProperties || 3,
        manualSelection: (sanityHome?.featuredEditorial?.manualSelection || []).map((ref: any) => {
          if (typeof ref === 'string') return ref;
          return ref?.propertyId || ref?.guestyListingId || ref?._ref || '';
        }),
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
      benefits: {
        backgroundImage: sanityHome?.benefits?.backgroundImage?.asset ? {
          _type: 'customImage',
          asset: { _ref: sanityHome.benefits.backgroundImage.asset._ref || sanityHome.benefits.backgroundImage.asset._id || '' }
        } : undefined,
        items: (sanityHome?.benefits?.items || []).map((item: any) => ({
          icon: item.icon || '',
          iconImage: item.iconImage?.asset ? {
            _type: 'customImage',
            asset: { _ref: item.iconImage.asset._ref || item.iconImage.asset._id || '' }
          } : undefined,
          title: item.title || '',
          description: item.description || ''
        }))
      },
      testimonials: {
        items: (sanityHome?.testimonials?.items || [])
          .filter((item: any) => item && item.quote)
          .map((item: any) => ({
          quote: item.quote || '',
          author: item.author || '',
          date: item.date || '',
          location: item.location || '',
          source: item.source || '',
          rating: item.rating,
          sourceLogo: item.sourceLogo?.asset ? {
            _type: 'customImage',
            asset: { _ref: item.sourceLogo.asset._ref || item.sourceLogo.asset._id || '' }
          } : undefined
        }))
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
      footerTags: sanityHome?.footer?.partnerTags || [],
      footerColumns: (sanityHome?.footer?.columns || []).map((col: any) => ({
        title: col.title || '',
        links: (col.links || []).map((link: any) => ({
          label: link.label || '',
          href: link.href || ''
        }))
      })),
      newsletter: {
        heading: sanityHome?.footer?.newsletter?.heading || 'Join the Miio Club for 10% off your first stay.',
        description: sanityHome?.footer?.newsletter?.description || '',
      }
    };
  }
}
