import { z } from 'zod';

import {
  hasAnyField,
  optionalEmail,
  optionalText,
  optionalUrl,
  requiredText,
} from '@/shared/utils/zod-fields';

export const updateShopSchema = z
  .object({
    name: requiredText(100),
    tagline: optionalText(500),
    hoursLabel: optionalText(50),
    hotline: optionalText(20),
    email: optionalEmail,
    facebookUrl: optionalUrl,
    zaloUrl: optionalUrl,
    tiktokUrl: optionalUrl,
    instagramUrl: optionalUrl,
    youtubeUrl: optionalUrl,
  })
  .partial()
  .refine(...hasAnyField);

export type UpdateShopDto = z.infer<typeof updateShopSchema>;
