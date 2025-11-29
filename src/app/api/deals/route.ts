import { NextRequest, NextResponse } from 'next/server'
import { getShuffledDeals } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50) // Max 50

  try {
    // Use shuffled deals for consistent pagination across the full pool
    const deals = await getShuffledDeals(limit, offset)

    return NextResponse.json(deals)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}
