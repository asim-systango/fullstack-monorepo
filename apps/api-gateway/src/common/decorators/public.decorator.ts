import { SetMetadata } from '@nestjs/common';

// Local gateway key — intentionally not imported from @shared/http/auth.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
