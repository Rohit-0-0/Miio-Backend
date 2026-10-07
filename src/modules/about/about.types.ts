import type { Image, Seo } from '@/types';

export interface AboutData {
  hero: {
    title: string;
    subtitle: string;
  };

  intro: {
    label: string;
    body: string;
  };

  story: {
    label: string;
    heading: string;
    paragraphs: string[];
    founderImage?: Image;
  };

  pullQuote: {
    text: string;
  };

  philosophy: {
    label: string;
    heading: string;
    paragraphs: string[];
  };

  closing: {
    body: string;
    cta: {
      text: string;
      href: string;
      style?: string;
    };
  };

  seo: Seo;
}

export interface AboutDocument extends AboutData {
  _id: string;
  _type: string;
}