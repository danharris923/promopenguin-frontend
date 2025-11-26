interface PriceDisplayProps {
  currentPrice: number | string | null
  originalPrice: number | string | null
  discountPercent: number | string | null
  size?: "sm" | "md" | "lg" | "xl"
}

export function PriceDisplay({
  currentPrice,
  originalPrice,
  discountPercent,
  size = "lg"
}: PriceDisplayProps) {
  const current = currentPrice != null ? Number(currentPrice) : null
  const original = originalPrice != null ? Number(originalPrice) : null
  const discount = discountPercent != null ? Number(discountPercent) : null

  const savings = original && current && !isNaN(original) && !isNaN(current)
    ? (original - current).toFixed(2)
    : null

  const sizeClasses = {
    sm: { current: "text-2xl", original: "text-sm", savings: "text-xs" },
    md: { current: "text-3xl", original: "text-base", savings: "text-sm" },
    lg: { current: "text-4xl", original: "text-lg", savings: "text-base" },
    xl: { current: "text-5xl", original: "text-xl", savings: "text-lg" },
  }

  const classes = sizeClasses[size]
  const originalClass = classes.original + " text-gray-400 line-through"
  const currentClass = classes.current + " font-black text-green-600"
  const currentClassAlt = classes.current + " font-black text-gray-800"
  const savingsClass = classes.savings + " text-red-600 font-bold"

  return (
    <div className="flex flex-col items-start gap-1">
      {original != null && !isNaN(original) && (
        <div className={originalClass}>
          ${original.toFixed(2)}
        </div>
      )}

      <div className="flex items-baseline gap-3">
        {current != null && !isNaN(current) ? (
          <span className={currentClass}>
            ${current.toFixed(2)}
          </span>
        ) : (
          <span className={currentClassAlt}>
            See Price
          </span>
        )}

        {discount != null && !isNaN(discount) && discount > 0 && (
          <span className="bg-red-600 text-white px-2 py-1 rounded-lg font-bold text-sm">
            -{discount}%
          </span>
        )}
      </div>

      {savings && (
        <div className={savingsClass}>
          You Save: ${savings}
        </div>
      )}
    </div>
  )
}
