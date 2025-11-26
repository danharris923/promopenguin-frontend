import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
