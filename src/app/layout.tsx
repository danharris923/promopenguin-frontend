import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PromoPenguin - Best Deals in Canada',
    template: '%s | PromoPenguin'
  },
  description: 'Find the best deals, sales, and discounts from top Canadian retailers. Save money on electronics, fashion, home, and more.',
  keywords: ['deals', 'canada', 'sales', 'discounts', 'coupons', 'savings', 'shopping'],
  authors: [{ name: 'PromoPenguin' }],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'PromoPenguin',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
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
        <script defer src="https://analytics.promopenguin.ca/script.js" data-website-id="715630ed-8d80-4747-a258-106d128f42a2"></script>
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
