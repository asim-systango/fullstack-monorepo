import { createHash } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { cloudinaryConfig } from '../../config/cloudinary.config';
import type { CloudinaryUploadFolder } from './dto/cloudinary-signature-query.dto';

const FOLDER_PREFIX = 'tastygo';

@Injectable()
export class UploadsService {
  createCloudinarySignature(folder: CloudinaryUploadFolder) {
    const config = cloudinaryConfig();
    if (!config.enabled) {
      throw new ServiceUnavailableException(
        'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const uploadFolder = `${FOLDER_PREFIX}/${folder}`;
    const paramsToSign = `folder=${uploadFolder}&timestamp=${timestamp}`;
    const signature = createHash('sha1')
      .update(paramsToSign + config.apiSecret)
      .digest('hex');

    return {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      timestamp,
      signature,
      folder: uploadFolder,
    };
  }
}
