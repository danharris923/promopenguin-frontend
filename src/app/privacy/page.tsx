import { Metadata } from 'next'
import Link from 'next/link'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | PromoPenguin',
  description: 'PromoPenguin privacy policy. Learn how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Last updated: November 2024
          </p>

          <h2>Introduction</h2>
          <p>
            PromoPenguin ("we", "our", or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, and
            safeguard your information when you visit our website.
          </p>

          <h2>Information We Collect</h2>
          <h3>Automatically Collected Information</h3>
          <p>
            When you visit PromoPenguin, we may automatically collect certain
            information about your device and usage, including:
          </p>
          <ul>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
            <li>IP address (anonymized)</li>
          </ul>

          <h3>Information You Provide</h3>
          <p>
            Currently, PromoPenguin does not require user registration or collect
            personal information directly. We do not ask for your name, email
            address, or other personally identifiable information.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul>
            <li>Analyze website traffic and usage patterns</li>
            <li>Remember your preferences</li>
            <li>Improve website performance</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Note that
            disabling cookies may affect website functionality.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We use the following third-party services:
          </p>
          <ul>
            <li>
              <strong>Analytics:</strong> To understand how visitors use our site
            </li>
            <li>
              <strong>Affiliate Networks:</strong> Amazon Associates and other
              programs that track purchases made through our links
            </li>
          </ul>
          <p>
            These third parties have their own privacy policies governing how
            they use your information.
          </p>

          <h2>Affiliate Links</h2>
          <p>
            PromoPenguin participates in affiliate programs, including Amazon
            Associates. When you click on affiliate links and make purchases, the
            retailer may collect information about your purchase. We may receive
            a commission, but we do not receive your personal purchase details.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement reasonable security measures to protect against
            unauthorized access, alteration, or destruction of data. However, no
            internet transmission is 100% secure.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            PromoPenguin is not intended for children under 13. We do not
            knowingly collect information from children under 13.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated revision date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please visit our{' '}
            <Link href="/about" className="text-orange-600 hover:text-orange-700">
              About page
            </Link>{' '}
            for contact information.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <p className="text-gray-600 text-sm">
              By using PromoPenguin, you agree to this Privacy Policy and our{' '}
              <Link href="/terms" className="text-orange-600 hover:text-orange-700">
                Terms of Service
              </Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
