import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { loadApiEnv } from '../../common/env';

export type UploadSignaturePayload = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private cloudName!: string;
  private apiKey!: string;
  // Kept private — never returned from generateUploadSignature or any HTTP response.
  private apiSecret!: string;

  onModuleInit() {
    // loadApiEnv already throws if any Cloudinary key is missing (Zod, same as JWT_SECRET).
    const env = loadApiEnv();
    this.cloudName = env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = env.CLOUDINARY_API_KEY;
    this.apiSecret = env.CLOUDINARY_API_SECRET;
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
    this.logger.log('Cloudinary SDK configured for signed resume uploads');
  }

  generateUploadSignature(candidateUserId: string): UploadSignaturePayload {
    // Namespace each candidate so signed uploads cannot write into another user's folder.
    const folder = `resumes/${candidateUserId}`;
    const timestamp = Math.round(Date.now() / 1000);
    // Sign only the params the browser will POST — never include api_secret in the payload.
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.apiSecret,
    );

    return {
      signature,
      timestamp,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder,
    };
  }

  async deleteAsset(publicId: string): Promise<void> {
    // PDFs uploaded as "raw" must be destroyed with resource_type: 'raw'.
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  }
}
