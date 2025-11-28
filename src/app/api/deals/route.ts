import { NextRequest, NextResponse } from 'next/server'
import { getDeals } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50) // Max 50

  try {
    const deals = await getDeals({
      limit,
      offset,
      orderBy: 'date_added',
      orderDir: 'DESC'
    })

    return NextResponse.json(deals)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}
