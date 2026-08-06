export interface AboutDto {
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
    founderImage?: string | null;
    altText?: string;
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
      style: string;
    };
  };
}
