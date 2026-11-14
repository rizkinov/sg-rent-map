import { districtData } from '@/data/districts/singapore-districts'
import type { District } from '@/types/district'

export function calcMedian(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

/**
 * Nearest-rank percentiles: for each p (0 to 100), the smallest value with at
 * least p% of the list at or below it, so the answer is always a real value
 * from the list. Sorts once for all of `percentiles`; an empty list gives 0s,
 * like calcMedian.
 */
export function calcPercentiles(values: number[], percentiles: number[]): number[] {
  if (!values.length) return percentiles.map(() => 0)
  // A typed array sorts numerically and quickly, and leaves `values` alone
  const sorted = Float64Array.from(values).sort()
  return percentiles.map(p => {
    // p * n first keeps whole ranks exact: 7 / 100 * 100 is 7.000000000000001,
    // which would round up to rank 8
    const rank = Math.ceil((p * sorted.length) / 100)
    return sorted[Math.min(Math.max(rank, 1), sorted.length) - 1]
  })
}

/**
 * The 1st to 99th percentile (nearest rank): the middle 98% of rents. Shown
 * instead of the raw min and max, which are single contracts that read like
 * errors. Below 100 values it equals the min and max.
 */
export function calcTypicalRange(values: number[]): { low: number; high: number } {
  const [low, high] = calcPercentiles(values, [1, 99])
  return { low, high }
}

export function getDistricts(): District[] {
  return districtData
}

export function getDistrictById(id: number): District | undefined {
  return districtData.find(district => district.id === id)
}

export function getDistrictsByRegion(region: string): District[] {
  return districtData.filter(district => district.region === region)
} 