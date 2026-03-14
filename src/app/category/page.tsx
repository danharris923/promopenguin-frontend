import Link from 'next/link'
import { Metadata } from 'next'
import { getCategories } from '@/lib/db'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'All Categories - PromoPenguin',
  description: 'Browse deals by category. Find discounts on electronics, fashion, home, grocery, beauty, sports and more from top Canadian retailers.',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Categories</h1>
          <p className="text-gray-500 mb-8">Browse deals by category</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="
                  bg-white border border-gray-200 rounded-lg p-6
                  hover:shadow-md hover:border-brand-blue transition-all
                  text-center
                "
              >
                <span className="font-medium text-gray-900">{cat.name}</span>
                {cat.deal_count > 0 && (
                  <span className="block text-sm text-gray-400 mt-1">{cat.deal_count} deals</span>
                )}
              </Link>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No categories available right now.</p>
              <Link href="/" className="text-brand-blue hover:underline">Browse all deals</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
