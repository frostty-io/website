import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { GitHubIcon } from 'nextra/icons'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Frostty',
    template: '%s | Frostty'
  },
  description: 'Cross-platform terminal emulator with vertical tabs, split panes, and smart workflows.',
  icons: {
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    icon: [
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      }
    ],
    shortcut: ['/favicon.ico']
  },
  manifest: '/site.webmanifest'
}

const navbar = (
  <Navbar
    className="gap-5"
    logo={
      <span className="inline-flex items-center gap-2">
        <Image src="/images/logo.png" alt="Frostty logo" width={32} height={32} />
        <span className="text-base font-extrabold tracking-tighter">frostty<span className="text-primary">.io</span></span>
      </span>
    }
  >
    <div className="ms-2 hidden items-center gap-1 md:flex">
      <Link
        href="/docs/"
        className="rounded-lg px-3 py-2 text-sm font-semibold tracking-[0.01em] transition hover:bg-black/10 dark:hover:bg-white/10"
      >
        Docs
      </Link>
      <Link
        href="/download/"
        className="rounded-lg px-3 py-2 text-sm font-semibold tracking-[0.01em] transition hover:bg-black/10 dark:hover:bg-white/10"
      >
        Download
      </Link>
      <a
        className="inline-flex items-center justify-center rounded-lg p-2 transition hover:bg-black/10 dark:hover:bg-white/10"
        href="https://github.com/frostty-io/frostty"
        aria-label="GitHub repository"
      >
        <GitHubIcon height="20" />
      </a>
    </div>
  </Navbar>
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
        color={{
          hue: 188,
          saturation: 86,
          lightness: 53
        }}
      >
        <meta name="theme-color" content="#0b1220" />
      </Head>
      <body className="min-h-screen bg-[radial-gradient(1000px_400px_at_15%_-10%,rgba(20,184,166,0.12),transparent_60%),radial-gradient(900px_420px_at_85%_-20%,rgba(34,211,238,0.12),transparent_60%)]">
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/frostty-io/website/tree/main"
          editLink={"Edit this page on GitHub"}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
        <SpeedInsights />
      </body>
    </html>
  )
}
