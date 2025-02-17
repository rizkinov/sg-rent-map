import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Property, PropertyType } from '@/types/property'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(price)
}

export function calculateAverageRent(properties: Property[]): number {
  if (!properties.length) return 0
  return Math.round(
    properties.reduce((sum, p) => sum + p.rental_price, 0) / properties.length
  )
}

export function getPropertyTypeColor(type: PropertyType): string {
  const colors: Record<PropertyType, string> = {
    'Condo': 'blue',
    'HDB': 'green',
    'Landed': 'orange'
  }
  return colors[type]
} 