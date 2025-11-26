interface StockWarningProps {
  variant: 'warning' | 'critical'
  message: string
}

export function StockWarning({ variant, message }: StockWarningProps) {
  const variantClasses = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    critical: 'bg-red-50 border-red-200 text-red-700 animate-pulse',
  }

  const icon = variant === 'critical' ? '🚨' : '⚠️'

  return (
    <div className={`
      flex items-center gap-2
      px-4 py-3 rounded-lg border
      ${variantClasses[variant]}
    `}>
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm">{message}</span>
    </div>
  )
}
