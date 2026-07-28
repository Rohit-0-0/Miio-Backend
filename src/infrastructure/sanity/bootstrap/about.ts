import { ABOUT_DOCUMENT } from '@/modules/about/constants';
import type { AboutDocument } from '@/modules/about/about.types';

export const DEFAULT_ABOUT_DATA: AboutDocument = {
  _id: ABOUT_DOCUMENT.ID,
  _type: ABOUT_DOCUMENT.TYPE,

  hero: {
    title: '',
    subtitle: '',
    backgroundImage: {
      assetId: '',
      alt: '',
    },
    cta: {
      label: '',
      href: '',
    },
  },

  story: {
    title: '',
    content: '',
    image: {
      assetId: '',
      alt: '',
    },
  },

  mission: {
    title: '',
    description: '',
  },

  vision: {
    title: '',
    description: '',
  },

  values: [],

  seo: {
    title: '',
    description: '',
    keywords: [],
  },

//   updatedAt: new Date().toISOString(),
};