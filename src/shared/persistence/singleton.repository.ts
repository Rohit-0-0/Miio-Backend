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
    const payload = {
      _id: this.documentId,
      _type: this.documentType,
      ...data,
    } as TData & { _id: string; _type: string };
    return sanityClient.createOrReplace(payload as Parameters<typeof sanityClient.createOrReplace>[0]) as Promise<TDocument>;
  }
}