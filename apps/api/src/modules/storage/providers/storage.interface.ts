export type StorageResourceType = 'image' | 'video';

export type UploadFileResult = {
  key: string;
  url: string;
};

export type DeleteFileOptions = {
  resourceType: StorageResourceType;
};

export interface IStorageProvider {
  uploadFile(
    file: Buffer,
    originalName: string,
    options: {
      prefix?: string;
      resourceType: StorageResourceType;
    },
  ): Promise<UploadFileResult>;

  deleteFile(key: string, options: DeleteFileOptions): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
