import { Metadata } from 'next'
import Link from 'next/link'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service | PromoPenguin',
  description: 'PromoPenguin terms of service. Read our terms and conditions for using the website.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Last updated: November 2024
          </p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using PromoPenguin ("the Site"), you agree to be bound
            by these Terms of Service. If you do not agree to these terms, please
            do not use the Site.
          </p>

          <h2>Description of Service</h2>
          <p>
            PromoPenguin is a deal aggregation website that collects and displays
            deals, sales, and discounts from various Canadian retailers. We do not
            sell products directly. All purchases are made through third-party
            retailers.
          </p>

          <h2>Accuracy of Information</h2>
          <p>
            While we strive to provide accurate and up-to-date deal information:
          </p>
          <ul>
            <li>Prices and availability may change without notice</li>
            <li>Deals may expire or sell out at any time</li>
            <li>We cannot guarantee the accuracy of all listed prices</li>
            <li>Always verify prices on the retailer's website before purchasing</li>
          </ul>

          <h2>Affiliate Relationships</h2>
          <p>
            PromoPenguin participates in affiliate advertising programs. This means:
          </p>
          <ul>
            <li>We may earn commissions on purchases made through our links</li>
            <li>This does not affect the price you pay</li>
            <li>We only recommend deals we believe offer genuine value</li>
            <li>Our editorial decisions are not influenced by affiliate relationships</li>
          </ul>

          <h2>User Conduct</h2>
          <p>
            When using PromoPenguin, you agree not to:
          </p>
          <ul>
            <li>Use the Site for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Site's operation</li>
            <li>Scrape or collect data without permission</li>
            <li>Use automated tools to access the Site excessively</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The content on PromoPenguin, including text, graphics, logos, and
            software, is owned by us or our licensors and is protected by
            copyright and other intellectual property laws.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            PromoPenguin contains links to third-party websites (retailers). We:
          </p>
          <ul>
            <li>Are not responsible for their content or practices</li>
            <li>Do not endorse or guarantee their products</li>
            <li>Encourage you to review their terms and privacy policies</li>
          </ul>

          <h2>Disclaimer of Warranties</h2>
          <p>
            PromoPenguin is provided "as is" without warranties of any kind. We
            do not guarantee that:
          </p>
          <ul>
            <li>The Site will be available at all times</li>
            <li>Deal information will be error-free</li>
            <li>Deals will be available when you attempt to purchase</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, PromoPenguin shall not be
            liable for any indirect, incidental, special, or consequential damages
            arising from your use of the Site or reliance on deal information.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will
            be effective immediately upon posting. Your continued use of the Site
            constitutes acceptance of the modified Terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by the laws of Canada. Any disputes shall be
            resolved in the courts of Canada.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these Terms, please visit our{' '}
            <Link href="/about" className="text-orange-600 hover:text-orange-700">
              About page
            </Link>.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <p className="text-gray-600 text-sm">
              By using PromoPenguin, you also agree to our{' '}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
