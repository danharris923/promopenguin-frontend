interface TrustBadgesProps {
  storeName?: string
}

export function TrustBadges({ storeName }: TrustBadgesProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
      <Badge icon="✓" text="Free Shipping" />
      <Badge icon="↩️" text="Easy Returns" />
      <Badge icon="🔒" text="Secure Checkout" />
      {storeName && <Badge icon="🏪" text={`Shop ${storeName}`} />}
    </div>
  )
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  )
}

// Store-specific trust badges
export function StoreBadge({ store }: { store: string | null }) {
  if (!store) return null

  const badges: Record<string, { color: string; text: string }> = {
    'amazon': { color: 'bg-orange-100 text-orange-800', text: '🚀 Prime Eligible' },
    'walmart': { color: 'bg-blue-100 text-blue-800', text: '📦 Free Pickup' },
    'costco': { color: 'bg-red-100 text-red-800', text: '🏷️ Member Price' },
    'best-buy': { color: 'bg-blue-100 text-blue-800', text: '💳 Price Match' },
  }

  const badge = badges[store]
  if (!badge) return null

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
      {badge.text}
    </span>
  )
}
