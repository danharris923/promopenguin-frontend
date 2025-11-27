import { Metadata } from 'next'
import Link from 'next/link'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About PromoPenguin - Canadian Deals Aggregator',
  description: 'Learn about PromoPenguin, your trusted source for Canadian deals, sales, and discounts from top retailers like Amazon.ca, Walmart, Costco and more.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">🐧</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About PromoPenguin
          </h1>
          <p className="text-xl text-gray-600">
            Your trusted source for Canadian deals and savings
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2>What is PromoPenguin?</h2>
          <p>
            PromoPenguin is a deal aggregation website that helps Canadians find
            the best prices, sales, and discounts from top retailers across the
            country. We automatically collect and curate deals from stores like
            Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire, and many more.
          </p>

          <h2>How Does It Work?</h2>
          <p>
            Our automated system scans popular Canadian deal forums, retailer
            websites, and RSS feeds every 4 hours to find the latest deals. We
            then organize these deals by store, category, and discount percentage
            to make it easy for you to find exactly what you're looking for.
          </p>

          <h2>Why Trust PromoPenguin?</h2>
          <ul>
            <li>
              <strong>Real-time updates:</strong> Deals are refreshed every 4 hours
            </li>
            <li>
              <strong>Verified sources:</strong> We only aggregate from trusted Canadian deal sources
            </li>
            <li>
              <strong>No spam:</strong> We don't require registration or send promotional emails
            </li>
            <li>
              <strong>Canadian focus:</strong> All deals are specifically for Canadian shoppers
            </li>
          </ul>

          <h2>Affiliate Disclosure</h2>
          <p>
            PromoPenguin is a participant in affiliate advertising programs,
            including the Amazon Associates Program. This means we may earn a
            commission when you make a purchase through our links at no additional
            cost to you. These commissions help us keep the site running and free
            for all users.
          </p>

          <h2>Contact Us</h2>
          <p>
            Have questions, feedback, or found a deal we should feature? We'd love
            to hear from you! While we don't have a dedicated support team, we do
            our best to respond to all inquiries.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/deals"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Browse All Deals →
              </Link>
              <Link
                href="/stores"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                View All Stores →
              </Link>
              <Link
                href="/privacy"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Privacy Policy →
              </Link>
              <Link
                href="/terms"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
