'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  resultCount: number
  children: React.ReactNode
}

/**
 * Bottom sheet that holds the filter panel below 768px. It overlays the map
 * rather than resizing it, so Leaflet never has to redraw on open or close.
 * It stays mounted while closed (hidden with `invisible`) so the panel keeps
 * its local state, such as the district search text.
 */
export function FilterSheet({ open, onClose, resultCount, children }: FilterSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    sheetRef.current?.focus({ preventScroll: true })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[1000] transition-[visibility] duration-300 motion-reduce:transition-none',
        open ? 'visible' : 'invisible pointer-events-none'
      )}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div
        ref={sheetRef}
        id="filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        tabIndex={-1}
        className={cn(
          'absolute inset-x-0 bottom-0 flex h-[88dvh] max-h-[calc(100dvh-env(safe-area-inset-top)-1rem)] flex-col overflow-hidden rounded-t-xl bg-background shadow-[0_-8px_24px_rgba(0,0,0,0.12)] outline-none',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="min-h-0 flex-1">{children}</div>

        <div className="shrink-0 border-t bg-background pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <Button type="button" onClick={onClose} className="h-11 w-full">
            Show {resultCount.toLocaleString('en-US')} {resultCount === 1 ? 'result' : 'results'}
          </Button>
        </div>
      </div>
    </div>
  )
}
