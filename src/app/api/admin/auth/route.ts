import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      // Admin password not configured - deny all access
      return NextResponse.json({ error: 'Admin access not configured' }, { status: 503 })
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
