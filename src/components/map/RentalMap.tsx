'use client'

import dynamic from 'next/dynamic'
import type { Property } from '@/types/property'

// Dynamically import the actual map component with no SSR
const DynamicMap = dynamic(() => import('./RentalMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-muted">
      Loading map...
    </div>
  ),
})

interface RentalMapProps {
  properties: Property[]
}

export function RentalMap({ properties }: RentalMapProps) {
  return <DynamicMap properties={properties} />
}