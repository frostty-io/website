import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { toAbsoluteUrl } from './seo'

const APP_DIRECTORY = path.join(process.cwd(), 'app')
const PAGE_FILE_PATTERN = /^page\.(mdx|tsx|ts|jsx|js)$/

export type DiscoveredPage = {
  routePath: string
  absoluteUrl: string
  sourcePath: string
  lastModified: Date
}

function isRouteGroup(segment: string): boolean {
  return segment.startsWith('(') && segment.endsWith(')')
}

function isInternalSegment(segment: string): boolean {
  return segment.startsWith('_')
}

function toRoutePath(segments: string[]): string | null {
  const publicSegments = segments.filter(segment => !isRouteGroup(segment))

  if (publicSegments.some(isInternalSegment)) {
    return null
  }

  if (publicSegments.length === 0) {
    return '/'
  }

  return `/${publicSegments.join('/')}/`
}

async function walkPages(
  absoluteDirectory: string,
  routeSegments: string[] = []
): Promise<Array<{ routePath: string; absoluteSourcePath: string; lastModified: Date }>> {
  const entries = await readdir(absoluteDirectory, { withFileTypes: true })
  const pages: Array<{ routePath: string; absoluteSourcePath: string; lastModified: Date }> = []

  for (const entry of entries) {
    if (entry.name.startsWith('_')) {
      continue
    }

    const absoluteEntryPath = path.join(absoluteDirectory, entry.name)

    if (entry.isDirectory()) {
      const nestedPages = await walkPages(absoluteEntryPath, [...routeSegments, entry.name])
      pages.push(...nestedPages)
      continue
    }

    if (!entry.isFile() || !PAGE_FILE_PATTERN.test(entry.name)) {
      continue
    }

    const routePath = toRoutePath(routeSegments)
    if (!routePath) {
      continue
    }

    const sourceStats = await stat(absoluteEntryPath)
    pages.push({
      routePath,
      absoluteSourcePath: absoluteEntryPath,
      lastModified: sourceStats.mtime
    })
  }

  return pages
}

export async function discoverPagesInDirectory(
  appDirectory: string,
  options: { rootDirectory?: string } = {}
): Promise<DiscoveredPage[]> {
  const rootDirectory = options.rootDirectory ?? process.cwd()
  const discovered = await walkPages(appDirectory)
  const uniqueByRoute = new Map<string, DiscoveredPage>()

  for (const page of discovered) {
    const absoluteUrl = toAbsoluteUrl(page.routePath)
    const current = uniqueByRoute.get(page.routePath)

    if (!current || page.lastModified > current.lastModified) {
      uniqueByRoute.set(page.routePath, {
        routePath: page.routePath,
        absoluteUrl,
        sourcePath: path.relative(rootDirectory, page.absoluteSourcePath).replace(/\\/g, '/'),
        lastModified: page.lastModified
      })
    }
  }

  return [...uniqueByRoute.values()].sort((left, right) => left.routePath.localeCompare(right.routePath))
}

export async function discoverPages(): Promise<DiscoveredPage[]> {
  return discoverPagesInDirectory(APP_DIRECTORY, { rootDirectory: process.cwd() })
}
