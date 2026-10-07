import { ABOUT_DOCUMENT } from '@/modules/about/constants';
import type { AboutDocument } from '@/modules/about/about.types';

export const DEFAULT_ABOUT_DATA: AboutDocument = {
  _id: ABOUT_DOCUMENT.ID,
  _type: ABOUT_DOCUMENT.TYPE,

  hero: {
    title: '',
    subtitle: '',
  },

  intro: {
    label: '',
    body: '',
  },

  story: {
    label: '',
    heading: '',
    paragraphs: [],
    founderImage: {
      assetId: '',
      alt: '',
    },
  },

  pullQuote: {
    text: '',
  },

  philosophy: {
    label: '',
    heading: '',
    paragraphs: [],
  },

  closing: {
    body: '',
    cta: {
      text: '',
      href: '',
    },
  },

  seo: {
    title: '',
    description: '',
    keywords: [],
  },

//   updatedAt: new Date().toISOString(),
};