import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private isCloudinaryConfigured = false;

  constructor() {
    this.uploadDir = path.resolve(
      process.cwd(),
      process.env.PRIVATE_OBJECT_DIR || 'uploads',
    );
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret && cloudName !== 'your_cloud_name') {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isCloudinaryConfigured = true;
      this.logger.log('Cloudinary SDK initialized successfully.');
    } else {
      this.logger.warn(
        'Cloudinary credentials missing or default. Falling back to local storage.',
      );
    }
  }

  async generateUploadUrl(fileName: string, contentType: string) {
    const fileExt = path.extname(fileName) || '.png';
    const objectId = `${randomUUID()}${fileExt}`;
    const objectPath = `/objects/${objectId}`;

    return {
      uploadURL: `/uploads/file/${objectId}`,
      objectPath,
      metadata: {
        name: fileName,
        contentType: contentType || 'application/octet-stream',
      },
    };
  }

  async saveUploadedFile(objectId: string, fileBuffer: Buffer): Promise<string> {
    if (this.isCloudinaryConfigured) {
      try {
        const publicId = path.parse(objectId).name;
        const ext = path.extname(objectId).toLowerCase();
        const isRawDocument =
          ext === '.pdf' || ext === '.doc' || ext === '.docx' || ext === '.txt';

        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                public_id: publicId,
                folder: 'pulsecare_uploads',
                resource_type: isRawDocument ? 'raw' : 'auto',
              },
              (error, result) => {
                if (error || !result) return reject(error);
                resolve(result);
              },
            );
            stream.end(fileBuffer);
          },
        );

        this.logger.log(`File uploaded to Cloudinary: ${uploadResult.secure_url}`);
        return uploadResult.secure_url;
      } catch (err) {
        this.logger.error('Failed to upload to Cloudinary, saving locally:', err);
      }
    }

    // Fallback to local file system
    const filePath = path.join(this.uploadDir, objectId);
    await fs.promises.writeFile(filePath, fileBuffer);
    this.logger.log(`File saved locally: ${filePath}`);
    return `/objects/${objectId}`;
  }

  async getFilePath(objectId: string): Promise<string | null> {
    const filePath = path.join(this.uploadDir, objectId);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }
}
