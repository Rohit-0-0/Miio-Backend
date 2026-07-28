import { SingletonRepository } from '@/shared/persistence/singleton.repository';

import type { AboutDocument } from './about.types';
import type { UpdateAboutInput } from './about.validation';
import { ABOUT_DOCUMENT } from './constants';

export class AboutRepository extends SingletonRepository<
  UpdateAboutInput,
  AboutDocument
> {
  constructor() {
    super(ABOUT_DOCUMENT.ID, ABOUT_DOCUMENT.TYPE);
  }
}