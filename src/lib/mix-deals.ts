import type { Deal } from '@/types/deal'

// Round-robin interleave of N deal arrays. Slot i in the output rotates
// through each non-empty source. When a source runs out, its slots are
// skipped. Given ([F1,F2], [R1,R2,R3], [G1]) the output is
// [F1, R1, G1, F2, R2, R3].
export function mixDeals(...sources: Deal[][]): Deal[] {
  const result: Deal[] = []
  const maxLen = Math.max(0, ...sources.map((s) => s.length))
  for (let i = 0; i < maxLen; i++) {
    for (const source of sources) {
      if (source[i]) result.push(source[i])
    }
  }
  return result
}
