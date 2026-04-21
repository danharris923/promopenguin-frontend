#!/usr/bin/env node
// Smoke test for the canadadealsdaily feed.
//
// Regression guard per PR spec: fetches the public feed, applies the
// same minimum validation the /daily page applies (id + title +
// main_affiliate_url present, not expired), and asserts that at least
// one rendered-eligible record has tag=f10a7654-20 baked into the
// affiliate URL. If upstream drops the tag, this exits 1 and the PR's
// CI should go red.
//
// Run: node scripts/smoke-deal-feed.mjs
import assert from "node:assert/strict"

const FEED_URL = "https://danharris923.github.io/canadadealsdaily/deals.json"
const REQUIRED_TAG = "tag=f10a7654-20"

const res = await fetch(FEED_URL)
assert.equal(res.ok, true, `feed fetch failed: ${res.status} ${res.statusText}`)

const body = await res.json()
assert.ok(Array.isArray(body), "feed root is not an array")
assert.ok(body.length > 0, "feed is empty")

const now = Date.now()
const renderable = body.filter((r) => {
  if (!r || typeof r !== "object") return false
  if (typeof r.id !== "string" || !r.id) return false
  if (typeof r.title !== "string" || !r.title) return false
  if (typeof r.main_affiliate_url !== "string" || !r.main_affiliate_url) return false
  if (typeof r.valid_until === "string") {
    const t = Date.parse(r.valid_until)
    if (Number.isFinite(t) && t < now) return false
  }
  return true
})
assert.ok(renderable.length > 0, "no renderable records in feed")

const tagged = renderable.filter((r) => r.main_affiliate_url.includes(REQUIRED_TAG))
assert.ok(
  tagged.length > 0,
  `no renderable card has main_affiliate_url containing ${REQUIRED_TAG}; ` +
    `sample url=${renderable[0].main_affiliate_url}`,
)

console.log(
  `ok — ${tagged.length}/${renderable.length} renderable cards carry ${REQUIRED_TAG}`,
)
