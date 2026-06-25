export interface StoredObject {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface StorageDriver {
  put(args: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<StoredObject>;
  delete(key: string): Promise<void>;
}
