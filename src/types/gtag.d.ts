// Google Analytics gtag.js type declarations
interface GtagEventParams {
  event_category?: string
  event_label?: string
  value?: number
  deal_id?: string | number
  store?: string | null
  is_affiliate?: boolean
  [key: string]: unknown
}

interface Window {
  gtag?: (
    command: 'event' | 'config' | 'set',
    targetId: string,
    config?: GtagEventParams
  ) => void
}
