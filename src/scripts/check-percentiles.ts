/**
 * Checks the nearest-rank percentile helpers behind the "Typical range" figure.
 * Run: npx ts-node --project tsconfig.scripts.json src/scripts/check-percentiles.ts
 */
import assert from 'node:assert/strict'
import { calcPercentiles, calcTypicalRange } from '@/lib/utils/district-utils'

// Empty list: zeros, like calcMedian
assert.deepEqual(calcPercentiles([], [1, 50, 99]), [0, 0, 0])
assert.deepEqual(calcTypicalRange([]), { low: 0, high: 0 })

// One value: every percentile is that value
assert.deepEqual(calcPercentiles([2500], [0, 1, 50, 99, 100]), [2500, 2500, 2500, 2500, 2500])
assert.deepEqual(calcTypicalRange([2500]), { low: 2500, high: 2500 })

// Ten values, unsorted. Nearest rank n = ceil(p/100 * 10), value = sorted[n - 1]:
// p1 -> n 1 -> 10, p10 -> n 1 -> 10, p11 -> n 2 -> 20, p50 -> n 5 -> 50,
// p90 -> n 9 -> 90, p91 -> n 10 -> 100, p99 -> n 10 -> 100, p0 -> first value
const ten = [70, 10, 100, 40, 90, 20, 60, 30, 80, 50]
const tenCopy = [...ten]
assert.deepEqual(
  calcPercentiles(ten, [0, 1, 10, 11, 50, 90, 91, 99, 100]),
  [10, 10, 10, 20, 50, 90, 100, 100, 100]
)
assert.deepEqual(ten, tenCopy, 'input must not be reordered')
// Below 100 values the 1st and 99th are simply the min and max
assert.deepEqual(calcTypicalRange(ten), { low: 10, high: 100 })

// Hand-checked 1st and 99th once there are enough values to drop the ends.
// 1..200: p1 -> n ceil(2) = 2 -> 2, p99 -> n ceil(198) = 198 -> 198
const twoHundred = Array.from({ length: 200 }, (_, i) => 200 - i)
assert.deepEqual(calcTypicalRange(twoHundred), { low: 2, high: 198 })
// 1..150: p1 -> n ceil(1.5) = 2 -> 2, p99 -> n ceil(148.5) = 149 -> 149
const oneFifty = Array.from({ length: 150 }, (_, i) => i + 1)
assert.deepEqual(calcTypicalRange(oneFifty), { low: 2, high: 149 })
// 1..300: p1 -> n 3 -> 3, p99 -> n 297 -> 297
const threeHundred = Array.from({ length: 300 }, (_, i) => i + 1)
assert.deepEqual(calcTypicalRange(threeHundred), { low: 3, high: 297 })
// 1..100, p7 -> n 7 -> 7 (7 / 100 * 100 is 7.000000000000001 in floating point)
const oneHundred = Array.from({ length: 100 }, (_, i) => i + 1)
assert.deepEqual(calcPercentiles(oneHundred, [1, 7, 57, 99]), [1, 7, 57, 99])

// The case that prompted this: one $400 and one $100,000 contract among 198
// ordinary rents. The typical range leaves both single contracts out.
const withOutliers = [400, 100000, ...Array.from({ length: 198 }, (_, i) => 2000 + i * 50)]
assert.deepEqual(calcTypicalRange(withOutliers), { low: 2000, high: 11800 })

console.log('check-percentiles: all passed')
