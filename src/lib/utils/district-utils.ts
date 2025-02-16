import { districtData } from '@/data/districts/singapore-districts'
import type { District } from '@/types/district'

export function getDistricts(): District[] {
  return districtData
}

export function getDistrictById(id: number): District | undefined {
  return districtData.find(district => district.id === id)
}

export function getDistrictsByRegion(region: string): District[] {
  return districtData.filter(district => district.region === region)
} 