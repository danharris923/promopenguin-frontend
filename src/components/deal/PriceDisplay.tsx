interface PriceDisplayProps {
  currentPrice: number | null
  originalPrice: number | null
  discountPercent: number | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function PriceDisplay({
  currentPrice,
  originalPrice,
  discountPercent,
  size = 'lg'
}: PriceDisplayProps) {
  const savings = originalPrice && currentPrice
    ? (originalPrice - currentPrice).toFixed(2)
    : null

  const sizeClasses = {
    sm: {
      current: 'text-2xl',
      original: 'text-sm',
      savings: 'text-xs',
    },
    md: {
      current: 'text-3xl',
      original: 'text-base',
      savings: 'text-sm',
    },
    lg: {
      current: 'text-4xl',
      original: 'text-lg',
      savings: 'text-base',
    },
    xl: {
      current: 'text-5xl',
      original: 'text-xl',
      savings: 'text-lg',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Original Price (struck through) */}
      {originalPrice && (
        <div className={`${classes.original} text-gray-400 line-through`}>
          ${originalPrice.toFixed(2)}
        </div>
      )}

      {/* Current Price */}
      <div className="flex items-baseline gap-3">
        {currentPrice ? (
          <span className={`${classes.current} font-black text-green-600`}>
            ${currentPrice.toFixed(2)}
          </span>
        ) : (
          <span className={`${classes.current} font-black text-gray-800`}>
            See Price
          </span>
        )}

        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <span className="bg-red-600 text-white px-2 py-1 rounded-lg font-bold text-sm">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Savings */}
      {savings && (
        <div className={`${classes.savings} text-red-600 font-bold`}>
          You Save: ${savings}
        </div>
      )}
    </div>
  )
}
