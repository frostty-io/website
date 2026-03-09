import { afterEach, describe, expect, it } from 'vitest'
import {
  buildPageMetadata,
  getDefaultRobotsDirectives,
  isProductionDeployment,
  toAbsoluteUrl,
  withTrailingSlash
} from './seo'

const mutableEnv = process.env as Record<string, string | undefined>
const ORIGINAL_VERCEL_ENV = process.env.VERCEL_ENV
const ORIGINAL_NODE_ENV = process.env.NODE_ENV

afterEach(() => {
  mutableEnv.VERCEL_ENV = ORIGINAL_VERCEL_ENV
  mutableEnv.NODE_ENV = ORIGINAL_NODE_ENV
})

describe('withTrailingSlash', () => {
  it('normalizes root and nested routes', () => {
    expect(withTrailingSlash('/')).toBe('/')
    expect(withTrailingSlash('/docs')).toBe('/docs/')
    expect(withTrailingSlash('docs')).toBe('/docs/')
    expect(withTrailingSlash('/docs//installation')).toBe('/docs/installation/')
  })

  it('does not append slash to file-like paths', () => {
    expect(withTrailingSlash('/sitemap.xml')).toBe('/sitemap.xml')
  })

  it('strips query and hash fragments', () => {
    expect(withTrailingSlash('/docs?tab=1')).toBe('/docs/')
    expect(withTrailingSlash('/docs#section')).toBe('/docs/')
  })
})

describe('toAbsoluteUrl', () => {
  it('returns canonical absolute URLs on the configured host', () => {
    expect(toAbsoluteUrl('/')).toBe('https://www.frostty.io/')
    expect(toAbsoluteUrl('/docs')).toBe('https://www.frostty.io/docs/')
  })
})

describe('isProductionDeployment', () => {
  it('prefers VERCEL_ENV when present', () => {
    mutableEnv.VERCEL_ENV = 'preview'
    mutableEnv.NODE_ENV = 'production'
    expect(isProductionDeployment()).toBe(false)

    mutableEnv.VERCEL_ENV = 'production'
    mutableEnv.NODE_ENV = 'development'
    expect(isProductionDeployment()).toBe(true)
  })

  it('falls back to NODE_ENV when VERCEL_ENV is missing', () => {
    delete mutableEnv.VERCEL_ENV
    mutableEnv.NODE_ENV = 'production'
    expect(isProductionDeployment()).toBe(true)

    mutableEnv.NODE_ENV = 'development'
    expect(isProductionDeployment()).toBe(false)
  })
})

describe('getDefaultRobotsDirectives', () => {
  it('allows indexing in production', () => {
    mutableEnv.VERCEL_ENV = 'production'
    const robots = getDefaultRobotsDirectives()
    expect(typeof robots).toBe('object')
    expect((robots as { index?: boolean })?.index).toBe(true)
    expect((robots as { follow?: boolean })?.follow).toBe(true)
  })

  it('disables indexing outside production', () => {
    mutableEnv.VERCEL_ENV = 'preview'
    const robots = getDefaultRobotsDirectives()
    expect(typeof robots).toBe('object')
    expect((robots as { index?: boolean })?.index).toBe(false)
    expect((robots as { follow?: boolean })?.follow).toBe(false)
  })
})

describe('buildPageMetadata', () => {
  it('builds canonical, open graph, and twitter metadata', () => {
    const metadata = buildPageMetadata({
      title: 'Docs',
      description: 'Documentation page',
      pathname: '/docs/'
    })

    expect(metadata.alternates?.canonical).toBe('https://www.frostty.io/docs/')
    expect(metadata.openGraph?.url).toBe('https://www.frostty.io/docs/')
    const openGraphImages = metadata.openGraph?.images as Array<{ url: string }>
    expect(openGraphImages[0]?.url).toBe('https://www.frostty.io/images/screenshot.png')
    expect((metadata.twitter as { card?: string })?.card).toBe('summary_large_image')
  })
})
