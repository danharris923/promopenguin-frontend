import { Metadata } from 'next'
import Link from 'next/link'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About PromoPenguin - Canadian Deals Aggregator',
  description: 'AI-powered deal aggregator scanning 50+ Canadian retailers every 4 hours. Amazon.ca, Walmart, Costco, Best Buy and more.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About PromoPenguin
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered Canadian deal aggregator
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2>What is this?</h2>
          <p>
            A bot that finds deals. We built an AI scraper that monitors Canadian
            retailers 24/7 - Amazon.ca, Walmart, Costco, Best Buy, Canadian Tire,
            and 50+ more stores. Every 4 hours it pulls fresh sales and posts them here.
          </p>

          <h2>How it works</h2>
          <p>
            Our scraper pulls from retailer feeds and aggregates everything into
            one place. Deals older than a week get automatically deleted. No humans
            are manually adding these - it's all automated.
          </p>

          <h2>What you should know</h2>
          <ul>
            <li>
              <strong>Updates every 4 hours:</strong> Fresh deals come in automatically
            </li>
            <li>
              <strong>Prices aren't verified:</strong> They come from retailer feeds, we don't check each one
            </li>
            <li>
              <strong>Deals expire:</strong> If you click and it's gone, it's gone
            </li>
            <li>
              <strong>No account needed:</strong> No signup, no newsletter, no tracking cookies
            </li>
          </ul>

          <h2>Affiliate Disclosure</h2>
          <p>
            We use affiliate links. When you buy through our links, we get a small
            commission at no extra cost to you. That's how we pay for servers and
            keep this free. We're part of Amazon Associates and other affiliate programs.
          </p>

          <h2>Contact</h2>
          <p>
            Found a bug? Have feedback? We're a small operation but we read everything.
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
