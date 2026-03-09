import type { Metadata } from 'next'

export const SITE_URL = 'https://www.frostty.io'
export const SITE_NAME = 'Frostty'
export const DEFAULT_OG_IMAGE = '/images/screenshot.png'

type OpenGraphType = 'website' | 'article'

export type SeoPageInput = {
  title: string
  description: string
  pathname: string
  type?: OpenGraphType
}

export function withTrailingSlash(pathname: string): string {
  const [rawPath] = pathname.split(/[?#]/)
  const prefixedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const normalizedPath = prefixedPath.replace(/\/{2,}/g, '/')

  if (normalizedPath === '/') {
    return normalizedPath
  }

  // Keep file-like paths unchanged (e.g. /sitemap.xml).
  if (/\/[^/]+\.[^/]+$/.test(normalizedPath)) {
    return normalizedPath
  }

  return normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`
}

export function toAbsoluteUrl(pathname: string): string {
  return new URL(withTrailingSlash(pathname), SITE_URL).toString()
}

export function isProductionDeployment(): boolean {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === 'production'
  }

  return process.env.NODE_ENV === 'production'
}

export function getDefaultRobotsDirectives(): Metadata['robots'] {
  if (isProductionDeployment()) {
    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }

  return {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': 0,
      'max-image-preview': 'none',
      'max-snippet': 0
    }
  }
}

export function buildPageMetadata({
  title,
  description,
  pathname,
  type = 'website'
}: SeoPageInput): Metadata {
  const canonical = toAbsoluteUrl(pathname)
  const socialImageUrl = toAbsoluteUrl(DEFAULT_OG_IMAGE)

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        {
          url: socialImageUrl,
          alt: 'Frostty terminal interface preview'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImageUrl]
    }
  }
}
