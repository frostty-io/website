import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { discoverPagesInDirectory } from './discover-pages'

async function writeAppFile(tempRoot: string, relativePath: string, content: string): Promise<string> {
  const absolutePath = path.join(tempRoot, relativePath)
  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, content, 'utf8')
  return absolutePath
}

describe('discoverPagesInDirectory', () => {
  const tempRoots: string[] = []

  afterEach(async () => {
    await Promise.all(tempRoots.map(tempRoot => rm(tempRoot, { recursive: true, force: true })))
    tempRoots.length = 0
  })

  it('discovers routable pages and excludes internal paths', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'frostty-discover-pages-'))
    tempRoots.push(tempRoot)

    await writeAppFile(tempRoot, 'app/page.mdx', '# Home')
    await writeAppFile(tempRoot, 'app/docs/page.mdx', '# Docs')
    await writeAppFile(tempRoot, 'app/docs/guide/page.tsx', 'export default function Page(){ return null }')
    await writeAppFile(tempRoot, 'app/(marketing)/about/page.mdx', '# About')
    await writeAppFile(tempRoot, 'app/_private/page.mdx', '# Hidden')
    await writeAppFile(tempRoot, 'app/docs/_draft/page.mdx', '# Draft')

    const pages = await discoverPagesInDirectory(path.join(tempRoot, 'app'), {
      rootDirectory: tempRoot
    })

    expect(pages.map(page => page.routePath)).toEqual(['/', '/about/', '/docs/', '/docs/guide/'])
    expect(pages.map(page => page.absoluteUrl)).toEqual([
      'https://www.frostty.io/',
      'https://www.frostty.io/about/',
      'https://www.frostty.io/docs/',
      'https://www.frostty.io/docs/guide/'
    ])
    expect(pages.every(page => page.sourcePath.startsWith('app/'))).toBe(true)
  })

  it('keeps the newest source when multiple files map to the same route', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'frostty-discover-pages-'))
    tempRoots.push(tempRoot)

    const olderPage = await writeAppFile(
      tempRoot,
      'app/docs/page.tsx',
      'export default function Page(){ return null }'
    )
    const newerPage = await writeAppFile(tempRoot, 'app/docs/page.mdx', '# Docs')

    const olderDate = new Date('2024-01-01T00:00:00.000Z')
    const newerDate = new Date('2025-01-01T00:00:00.000Z')
    await utimes(olderPage, olderDate, olderDate)
    await utimes(newerPage, newerDate, newerDate)

    const pages = await discoverPagesInDirectory(path.join(tempRoot, 'app'), {
      rootDirectory: tempRoot
    })

    expect(pages).toHaveLength(1)
    expect(pages[0].routePath).toBe('/docs/')
    expect(pages[0].sourcePath).toBe('app/docs/page.mdx')
    expect(pages[0].lastModified.toISOString()).toBe('2025-01-01T00:00:00.000Z')
  })
})
