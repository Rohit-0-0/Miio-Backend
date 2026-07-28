import { sanityClient } from '@/infrastructure/sanity';
export abstract class SingletonRepository<TData, TDocument> {
  constructor(
    protected readonly documentId: string,
    protected readonly documentType: string,
  ) {}

  async find(): Promise<TDocument | null> {
    return sanityClient.getDocument(this.documentId) as Promise<TDocument | null>;
  }

  async save(data: TData): Promise<TDocument> {
    return sanityClient.createOrReplace({
      _id: this.documentId,
      _type: this.documentType,
      ...data,
    } as any) as Promise<TDocument>;
  }
}