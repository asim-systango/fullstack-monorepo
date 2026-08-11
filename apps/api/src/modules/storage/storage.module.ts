import { Module, type Provider } from '@nestjs/common';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { STORAGE_PROVIDER, type IStorageProvider } from './providers/storage.interface';
import { StorageService } from './services/storage.service';

const StorageProviderFactory: Provider<IStorageProvider> = {
  provide: STORAGE_PROVIDER,
  useFactory: (): IStorageProvider => new CloudinaryProvider(),
};

@Module({
  providers: [StorageService, StorageProviderFactory],
  exports: [StorageService],
})
export class StorageModule {}
