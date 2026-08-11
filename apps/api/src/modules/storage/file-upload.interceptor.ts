import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MEDIA_UPLOAD_MAX_BYTES,
} from '../media/media.constants';

/** Multipart interceptor for POST /media. */
export const createMediaUploadInterceptor = (fieldName = 'file') =>
  FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: { fileSize: MEDIA_UPLOAD_MAX_BYTES },
    fileFilter: (_req, file, callback) => {
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      if (
        !extension ||
        !ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])
      ) {
        return callback(
          new BadRequestException(
            `Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`,
          ),
          false,
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed`,
          ),
          false,
        );
      }

      callback(null, true);
    },
  });
