import { NextRequest, NextResponse } from 'next/server'

/**
 * Affiliate redirect wrapper
 *
 * Sets affiliate cookie via the tracking link, then redirects to search URL
 *
 * Usage: /api/go?a=AFFILIATE_URL&s=SEARCH_URL
 * - a: Affiliate tracking URL (rstyle.me, etc.) - sets cookie
 * - s: Search URL - where user ends up
 */
export async function GET(request: NextRequest) {
  // Get raw query string to preserve + signs (searchParams decodes them as spaces)
  const url = new URL(request.url)
  const rawQuery = url.search.slice(1) // Remove leading ?
  const params = new URLSearchParams(rawQuery)

  // Decode but preserve the actual URL structure
  const affiliateUrl = params.get('a')
  const searchUrl = params.get('s')

  if (!searchUrl) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If we have both affiliate and search URLs:
  // Fire affiliate beacon and redirect immediately - browser completes request in background
  if (affiliateUrl) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
</head>
<body>
  <img src="${affiliateUrl}" width="1" height="1" style="position:absolute;left:-9999px" alt="">
  <script>window.location.replace("${searchUrl}")</script>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  // No affiliate URL, just redirect to search
  return NextResponse.redirect(searchUrl)
}
