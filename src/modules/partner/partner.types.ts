import type { Image } from '@/types';

export interface PartnerData {
  title: string;
  subtitle: string;
  partners: {
    name: string;
    logo: Image;
    url?: string;
  }[];
}

export interface PartnerDocument extends PartnerData {
  _id: string;
  _type: string;
}
