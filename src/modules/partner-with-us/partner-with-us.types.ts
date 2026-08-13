export interface PartnerWithUsData {
  headline: string;
  problem: string;
  solution: string;
  processCtaText?: string;
  ctaButton?: {
    label?: string;
    link?: string;
  };
}

export interface PartnerWithUsDocument extends PartnerWithUsData {
  _id: string;
  _type: string;
}
