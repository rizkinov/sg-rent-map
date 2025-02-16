'use client'

import { useEffect, useState } from 'react'
import { RentalMap } from '@/components/map/RentalMap'
import { PropertyFilters } from '@/components/filters/PropertyFilters'
import { getProperties } from '@/lib/supabase/properties'
import type { Property, FilterParams } from '@/types/property'

// Refresh interval in milliseconds (e.g., every 5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadProperties(filters?: FilterParams) {
    try {
      setLoading(true)
      const data = await getProperties(filters)
      setProperties(data)
      setError(null)
    } catch (err) {
      setError('Failed to load properties')
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load and periodic refresh
  useEffect(() => {
    loadProperties()

    const interval = setInterval(() => {
      loadProperties()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="p-4">
          <h1 className="text-2xl font-bold tracking-tight">Singapore Rental Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore and filter rental properties across Singapore with real-time updates and interactive mapping
          </p>
          {error && (
            <div className="text-sm text-red-500 mt-1">
              {error}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <aside className="w-80 border-r">
          <PropertyFilters 
            onFilterChange={loadProperties}
            disabled={loading}
          />
        </aside>
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
              Loading...
            </div>
          )}
          <RentalMap properties={properties} />
        </div>
      </div>
    </main>
  )
} 