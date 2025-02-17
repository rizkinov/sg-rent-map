import { supabase } from '@/lib/supabase/client'
import type { Property } from '@/types/property'

const PAGE_SIZE = 1000

export async function getProperties(): Promise<Property[]> {
  try {
    // Add loading state element
    const loadingEl = document.createElement('div')
    loadingEl.className = 'fixed inset-0 flex items-center justify-center font-inter text-muted-foreground z-50 bg-background/80'
    
    let allProperties: Property[] = []
    let currentPage = 0
    let hasMore = true
    let totalCount = 0

    // Get total count first
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })

    if (count) {
      totalCount = count
    }

    while (hasMore) {
      // Update loading message
      loadingEl.innerHTML = `
        <div class="text-center">
          <div class="text-sm">
            ${allProperties.length.toLocaleString()} of ${totalCount.toLocaleString()} properties loaded
          </div>
        </div>
      `
      
      if (!document.body.contains(loadingEl)) {
        document.body.appendChild(loadingEl)
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

      if (error) {
        throw error
      }

      if (data) {
        allProperties = [...allProperties, ...data]
        hasMore = data.length === PAGE_SIZE
        currentPage++
      } else {
        hasMore = false
      }
    }

    // Remove loading element when done
    loadingEl.remove()

    // Process bedroom counts for 5+ bedrooms
    allProperties = allProperties.map(property => ({
      ...property,
      // Keep original beds value but ensure filtering works correctly
      beds: property.beds && property.beds >= 5 ? 5 : property.beds
    }))

    console.log('Total properties fetched:', allProperties.length)
    return allProperties
  } catch (error) {
    console.error('Error in getProperties:', error)
    throw error
  }
} 