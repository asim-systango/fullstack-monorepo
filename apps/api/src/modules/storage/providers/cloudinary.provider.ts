import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { loadApiEnv } from '@shared/env/api';
import type {
  DeleteFileOptions,
  IStorageProvider,
  StorageResourceType,
  UploadFileResult,
} from './storage.interface';

@Injectable()
export class CloudinaryProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor() {
    const env = loadApiEnv();
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async uploadFile(
    file: Buffer,
    originalName: string,
    options: {
      prefix?: string;
      resourceType: StorageResourceType;
    },
  ): Promise<UploadFileResult> {
    const extension = extname(originalName).replace('.', '');
    const prefix = options.prefix?.replace(/\/$/, '') ?? '';
    const key = prefix ? `${prefix}/${randomUUID()}` : randomUUID();

    try {
      const uploaded = await new Promise<{
        secure_url: string;
        width?: number;
        height?: number;
        duration?: number;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: key,
            resource_type: options.resourceType,
            ...(extension ? { format: extension } : {}),
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error('Empty Cloudinary upload response'));
              return;
            }
            resolve(result);
          },
        );
        stream.end(file);
      });

      this.logger.log(`Uploaded key=${key}`);
      return {
        key,
        url: uploaded.secure_url,
        ...toStoredDimensions(uploaded.width, uploaded.height),
        durationSeconds: toStoredDuration(uploaded.duration),
      };
    } catch (error) {
      throw this.toGatewayError(error, 'upload');
    }
  }

  async deleteFile(key: string, options: DeleteFileOptions): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key, {
        resource_type: options.resourceType,
        invalidate: true,
      });
    } catch (error) {
      throw this.toGatewayError(error, 'delete');
    }
  }

  /** Cloudinary often rejects with plain objects — normalize for Nest filters. */
  private toGatewayError(error: unknown, operation: string): BadGatewayException {
    const message = extractCloudinaryMessage(error);
    this.logger.error(`Cloudinary ${operation} failed: ${message}`);
    return new BadGatewayException({
      message: `Media storage ${operation} failed`,
      details: { reason: message },
    });
  }
}

/** CHK_media_dimensions requires both null or both > 0. */
function toStoredDimensions(
  width: number | undefined,
  height: number | undefined,
): { width: number | null; height: number | null } {
  if (
    typeof width === 'number' &&
    width > 0 &&
    typeof height === 'number' &&
    height > 0
  ) {
    return { width, height };
  }
  return { width: null, height: null };
}

function toStoredDuration(duration: number | undefined): number | null {
  return typeof duration === 'number' && duration >= 0 ? duration : null;
}

function extractCloudinaryMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.length > 0) {
      return record.message;
    }
    if (typeof record.error === 'object' && record.error !== null) {
      const nested = record.error as Record<string, unknown>;
      if (typeof nested.message === 'string') {
        return nested.message;
      }
    }
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown Cloudinary error';
    }
  }
  return String(error);
}
