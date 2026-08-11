import { Inject, Injectable } from '@nestjs/common';
import {
  STORAGE_PROVIDER,
  type DeleteFileOptions,
  type IStorageProvider,
  type StorageResourceType,
  type UploadFileResult,
} from '../providers/storage.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  uploadFile(
    file: Buffer,
    originalName: string,
    options: {
      prefix?: string;
      resourceType: StorageResourceType;
    },
  ): Promise<UploadFileResult> {
    return this.storageProvider.uploadFile(file, originalName, options);
  }

  deleteFile(key: string, options: DeleteFileOptions): Promise<void> {
    return this.storageProvider.deleteFile(key, options);
  }
}
