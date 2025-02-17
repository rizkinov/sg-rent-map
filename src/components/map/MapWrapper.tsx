'use client'

import dynamic from 'next/dynamic'
import type { Property } from '@/types/property'

const RentalMapComponent = dynamic(() => import('./RentalMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      Loading map...
    </div>
  )
})

interface MapWrapperProps {
  properties: Property[]
}

export function MapWrapper({ properties }: MapWrapperProps) {
  return <RentalMapComponent properties={properties} />
} 