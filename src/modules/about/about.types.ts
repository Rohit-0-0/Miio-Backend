import type { Image, Seo } from '@/types';

export interface AboutData {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: Image;
    cta: {
      label: string;
      href: string;
    };
  };

  story: {
    title: string;
    content: string;
    image: Image;
  };

  mission: {
    title: string;
    description: string;
  };

  vision: {
    title: string;
    description: string;
  };

  values: {
    title: string;
    description: string;
    icon: string;
  }[];

  seo: Seo;
}

export interface AboutDocument extends AboutData {
  _id: string;
  _type: string;
}