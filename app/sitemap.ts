import type { MetadataRoute } from 'next'
import { discoverPages } from '../lib/discover-pages'

export const dynamic = 'force-static'

function resolveChangeFrequency(pathname: string): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (pathname === '/') {
    return 'weekly'
  }

  if (pathname === '/download/') {
    return 'daily'
  }

  if (pathname === '/docs/') {
    return 'weekly'
  }

  if (pathname.startsWith('/docs/')) {
    return 'monthly'
  }

  return 'weekly'
}

function resolvePriority(pathname: string): number {
  if (pathname === '/') {
    return 1.0
  }

  if (pathname === '/download/') {
    return 0.9
  }

  if (pathname === '/docs/') {
    return 0.8
  }

  if (pathname.startsWith('/docs/')) {
    return 0.7
  }

  return 0.6
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await discoverPages()

  return pages.map(page => ({
    url: page.absoluteUrl,
    lastModified: page.lastModified,
    changeFrequency: resolveChangeFrequency(page.routePath),
    priority: resolvePriority(page.routePath)
  }))
}
