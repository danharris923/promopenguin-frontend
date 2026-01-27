import { NextResponse } from 'next/server'
import { getAllStoresAdmin, updateStoreUrls, addStore, checkStoreSlugExists } from '@/lib/db'

function checkAuth(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  const auth = request.headers.get('Authorization')
  return auth === adminPassword
}

// GET all stores
export async function GET() {
  try {
    const stores = await getAllStoresAdmin()
    return NextResponse.json({ stores })
  } catch (error) {
    // Error fetching stores
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
  }
}

// PUT - update store URLs
export async function PUT(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, website_url, affiliate_url } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
    }

    const success = await updateStoreUrls(id, website_url || null, affiliate_url || null)
    if (!success) {
      return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Error updating store
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
  }
}

// POST - add new store
export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, slug, website_url, affiliate_url } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
    }

    // Check if slug already exists
    const exists = await checkStoreSlugExists(slug)
    if (exists) {
      return NextResponse.json({ error: 'Store with this slug already exists' }, { status: 409 })
    }

    const success = await addStore(name, slug, website_url || null, affiliate_url || null)
    if (!success) {
      return NextResponse.json({ error: 'Failed to add store' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Error adding store
    return NextResponse.json({ error: 'Failed to add store' }, { status: 500 })
  }
}
