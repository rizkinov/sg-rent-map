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

export function getDistricts(): District[] {
  return districtData
}

export function getDistrictById(id: number): District | undefined {
  return districtData.find(district => district.id === id)
}

export function getDistrictsByRegion(region: string): District[] {
  return districtData.filter(district => district.region === region)
} 