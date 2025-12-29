import type { Metadata, Viewport } from 'next'

import '@/styles/globals.css'

import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/utils'
import { GeistSans } from 'geist/font/sans'

import Footer from '@/components/footer'
import Header from '@/components/header'
import ScrollToTop from '@/components/scroll-to-top'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/constants'

import Providers from './providers'

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
    canonical: SITE_URL
  },
  keywords: ['blog', 'devops', 'cloud computing', 'kubernetes', 'terraform', 'docker', 'aws', 'azure', 'infrastructure', 'automation', 'ci/cd', 'nextjs blog', 'tech blog'],
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
  themeColor: {
    color: '#000000'
  }
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
    <html lang='en-US' className={cn(GeistSans.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // @ts-ignore: JSON is available in the browser environment
          dangerouslySetInnerHTML={{ __html: globalThis.JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <Header />
          <main id="main-content" className='min-h-page mx-auto max-w-6xl px-6 pt-40 sm:pt-44 md:pt-48 pb-16'>{children}</main>
          <Toaster />
          <ScrollToTop />
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
