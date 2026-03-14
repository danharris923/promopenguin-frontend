import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin access not configured' }, { status: 503 })
    }

    if (safeCompare(password, adminPassword)) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
