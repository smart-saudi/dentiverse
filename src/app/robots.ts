import type { MetadataRoute } from 'next';

import { APP_URL } from '@/lib/constants';

/**
 * Generates robots.txt for search engine crawlers.
 *
 * @returns Robots configuration
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/settings/', '/cases/', '/proposals/', '/payments/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
