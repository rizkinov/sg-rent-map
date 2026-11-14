'use client'

import { forwardRef } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface PhoneTopBarProps {
  average: number | null
  median: number | null
  activeFilterCount: number
  filtersOpen: boolean
  onOpenFilters: () => void
}

/**
 * The compact header shown above the map below 768px: the lifekit eyebrow and
 * title, the live average and median of the filtered rentals, and the button
 * that opens the filter sheet. The ref goes to that button so focus can
 * return to it when the sheet closes.
 */
export const PhoneTopBar = forwardRef<HTMLButtonElement, PhoneTopBarProps>(
  function PhoneTopBar(
    { average, median, activeFilterCount, filtersOpen, onOpenFilters },
    filtersButtonRef
  ) {
    return (
      <header className="relative z-10 shrink-0 bg-background pb-2.5 pt-[env(safe-area-inset-top)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {/* 44px tall tap target; the title tucks up under its lower edge
                and lets taps through so the gap reads like the desktop panel */}
            <a
              href="https://www.lifekit.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-[#b5484d] transition-colors"
            >
              lifekit.sg / housing
            </a>
            <h1 className="pointer-events-none -mt-3 text-lg font-semibold tracking-tight truncate">
              Singapore Rent Map
            </h1>
          </div>

          <Button
            ref={filtersButtonRef}
            type="button"
            variant="outline"
            onClick={onOpenFilters}
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
            aria-controls="filter-sheet"
            className="h-11 shrink-0 gap-2 px-3.5"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-primary-foreground tabular-nums"
                >
                  {activeFilterCount}
                </span>
                <span className="sr-only">, {activeFilterCount} active</span>
              </>
            )}
          </Button>
        </div>

        <dl className="mt-1.5 flex items-baseline gap-5">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-xs font-medium text-muted-foreground">Average</dt>
            <dd className="text-base font-semibold tabular-nums">
              {average === null ? '—' : `$${formatPrice(average)}`}
            </dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-xs font-medium text-muted-foreground">Median</dt>
            <dd className="text-base font-semibold tabular-nums">
              {median === null ? '—' : `$${formatPrice(median)}`}
            </dd>
          </div>
        </dl>
      </header>
    )
  }
)
