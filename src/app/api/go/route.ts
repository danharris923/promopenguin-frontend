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

const ALLOWED_REDIRECT_DOMAINS = [
  'amazon.ca', 'amazon.com',
  'walmart.ca', 'walmart.com',
  'costco.ca',
  'bestbuy.ca',
  'canadiantire.ca',
  'shoppers.ca', 'shoppersdrugmart.ca',
  'well.ca',
  'thebay.com', 'hudsonsbay.com',
  'sportchek.ca',
  'mec.ca',
  'ikea.ca',
  'wayfair.ca',
  'sephora.com',
  'lululemon.com',
  'aritzia.com',
  'simons.ca',
  'footlocker.ca', 'footlocker.com',
  'urbanoutfitters.com',
  'freepeople.com',
  'anthropologie.com',
  'abercrombie.com',
  'ae.com',
  'aloyoga.com',
  'guess.ca', 'guess.com',
  'skims.com',
  'revolve.com',
  'princesspolly.com',
  'shopbop.com',
  'vuoriclothing.com',
  'lulus.com',
  'madewell.com',
  'cottononus.com', 'cottonon.com',
  'nastygal.com',
  'prettylittlething.com', 'prettylittlething.ca',
  'stevemadden.ca', 'stevemadden.com',
  'newbalance.ca', 'newbalance.com',
  'birkenstock.ca', 'birkenstock.com',
  'ugg.com',
  'charlottetilbury.com',
  'tartecosmetics.com',
  'elfcosmetics.com',
  'tula.com',
  'colleen-rothschild.com', 'colleenrothschild.com',
  'dimebeauty.co',
  'meritbeauty.com',
  'supergoop.com',
  'crateandbarrel.com',
  'potterybarn.com',
  'westelm.com',
  'cb2.com',
  'dyson.ca', 'dyson.com',
  'brooklinen.com',
  'newegg.ca',
  'memoryexpress.com',
  'staples.ca',
  'thesource.ca',
  'atmosphere.ca',
  'loblaws.ca',
  'metro.ca',
  'sobeys.com',
  'saveonfoods.com',
  'safeway.ca',
  'londondrugs.com',
  'rfrk.com',
  'rstyle.me',
  'linksynergy.com',
  'rakuten.ca',
  'shopstyle.com',
  'pntra.com', 'pntrs.com', 'pntrac.com',
  'anrdoezrs.net', 'jdoqocy.com', 'tkqlhce.com', 'dpbolvw.net', 'kqzyfj.com',
  'shareasale.com',
  'avantlink.com',
  'impact.com',
  'partnerize.com',
]

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    const hostname = url.hostname.toLowerCase()
    return ALLOWED_REDIRECT_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const rawQuery = url.search.slice(1)
  const params = new URLSearchParams(rawQuery)

  const affiliateUrl = params.get('a')
  const searchUrl = params.get('s')

  if (!searchUrl || !isAllowedUrl(searchUrl)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (affiliateUrl) {
    if (!isAllowedUrl(affiliateUrl)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const safeAffiliateUrl = escapeHtml(affiliateUrl)
    const safeSearchUrl = escapeHtml(searchUrl)

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
</head>
<body>
  <img src="${safeAffiliateUrl}" width="1" height="1" style="position:absolute;left:-9999px" alt="">
  <script>window.location.replace("${safeSearchUrl}")</script>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  return NextResponse.redirect(searchUrl)
}
