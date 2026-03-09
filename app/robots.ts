import type { MetadataRoute } from 'next'
import { SITE_URL, isProductionDeployment, toAbsoluteUrl } from '../lib/seo'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  if (isProductionDeployment()) {
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/'
        }
      ],
      sitemap: [toAbsoluteUrl('/sitemap.xml')],
      host: SITE_URL
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/'
      }
    ],
    sitemap: [toAbsoluteUrl('/sitemap.xml')],
    host: SITE_URL
  }
}
