import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { SITE_URL } from '@/lib/config'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PromoPenguin - Best Deals in Canada',
    template: '%s | PromoPenguin'
  },
  description:
    'PromoPenguin helps Canadians discover the best deals, sales, and discounts from top retailers like Amazon Canada, Walmart Canada, Costco, Best Buy, Canadian Tire, and more. Save money every day on electronics, fashion, home essentials, groceries, and thousands of products across Canada.',
  keywords: [
    'deals',
    'canada',
    'sales',
    'discounts',
    'coupons',
    'savings',
    'shopping',
    'canadian deals',
    'amazon canada deals',
    'walmart canada sales',
    'costco deals canada',
    'best buy canada deals',
    'canadian tire sales',
    'shoppers drug mart deals',
    'best deals in canada',
    'online shopping canada',
    'price drops canada',
    'clearance sales canada',
    'daily deals canada',
    'flyer deals',
    'promo codes canada',
  ],
  authors: [{ name: 'PromoPenguin' }],
  publisher: 'PromoPenguin',
  creator: 'PromoPenguin',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: SITE_URL,
    title: 'PromoPenguin - Best Deals in Canada',
    description:
      'Discover the best deals, sales, and discounts from top Canadian retailers. Save money on electronics, fashion, home, groceries, and more.',
    siteName: 'PromoPenguin',
    images: [
      {
        url: `${SITE_URL}/hero-desktop.png`,
        width: 1200,
        height: 630,
        alt: 'PromoPenguin - Best Deals in Canada',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromoPenguin - Best Deals in Canada',
    description:
      'Discover the best deals, sales, and discounts from top Canadian retailers. Save money on electronics, fashion, home, groceries, and more.',
    images: [`${SITE_URL}/hero-desktop.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-CA">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a5f" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="preload"
          href="/hero-desktop.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/hero-mobile.png"
          as="image"
          type="image/png"
        />
        <Script
          src="https://analytics.promopenguin.ca/script.js"
          data-website-id="30045994-c858-4e3a-bb6c-fc15e2471852"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
