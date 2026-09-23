import type { Metadata, Viewport } from 'next'

import '@/styles/globals.css'

import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/utils'
import { Instrument_Sans, Space_Grotesk } from 'next/font/google'

import Footer from '@/components/footer'
import Header from '@/components/header'
import HudFooter from '@/components/hud-footer'
import ScrollToTop from '@/components/scroll-to-top'
import TopTicker from '@/components/top-ticker'
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL
} from '@/lib/constants'

import Providers from './providers'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

type RootLayoutProps = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  manifest: '/favicon/site.webmanifest',
  twitter: {
    title: SITE_NAME,
    card: 'summary_large_image',
    site: '@NotHarshhaa',
    creator: '@NotHarshhaa',
    images: [
      {
        url: '/images/cover.png',
        width: 1280,
        height: 832,
        alt: SITE_DESCRIPTION
      }
    ]
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: `${SITE_TITLE} RSS Feed` }]
    }
  },
  keywords: [...SITE_KEYWORDS],
  creator: 'NotHarshhaa',
  authors: [{ name: 'NotHarshhaa', url: SITE_URL }],
  category: 'Technology',
  openGraph: {
    url: SITE_URL,
    type: 'website',
    title: SITE_TITLE,
    siteName: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'en-US',
    images: [
      {
        url: '/images/cover.png',
        width: 1280,
        height: 832,
        alt: SITE_DESCRIPTION,
        type: 'image/png'
      }
    ]
  },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon.ico',
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon/favicon-16x16.png'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon/favicon-32x32.png'
      }
    ]
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f2e8' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ]
}

const RootLayout = (props: RootLayoutProps) => {
  const { children } = props

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    author: {
      '@type': 'Person',
      name: 'NotHarshhaa',
      url: SITE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_TITLE,
      url: SITE_URL
    },
    inLanguage: 'en-US',
    isAccessibleForFree: true
  }

  return (
    <html
      lang="en-US"
      className={cn(
        'min-h-screen font-sans antialiased',
        instrumentSans.variable,
        spaceGrotesk.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          // @ts-ignore: JSON is available in the browser environment
          dangerouslySetInnerHTML={{ __html: globalThis.JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <TopTicker />
        <Providers>
          <div className="px-4 pt-3 sm:px-6 sm:pt-5 lg:px-8">
            <Header />
          </div>
          <main
            id="main-content"
            className="mx-auto min-h-[calc(100vh-14rem)] w-full max-w-[90rem] px-4 pt-6 pb-20 sm:px-6 sm:pt-10 sm:pb-24 lg:px-8"
          >
            {children}
          </main>
          <Toaster />
          <ScrollToTop />
          <Footer />
          <HudFooter />
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
