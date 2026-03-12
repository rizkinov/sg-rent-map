-- Migration: Update rental prices to Q1 2026 market levels
--
-- Applies region-based % adjustments to individual property rental_price values
-- based on URA, 99.co, ERA, and Savills Q1 2026 market data:
--
--   CCR (Districts 1,2,4,6,9,10,11): +4.5% (CCR rents +3.2% YoY, compounded from Dec-24)
--   RCR (Districts 3,5,7,8,12,13,14,15): +3.0% (RCR rents +1.7% YoY)
--   OCR (Districts 16-28): +2.5% (OCR rents +2.2% YoY)
--   Exception: District 21 (Clementi) +5.5% (6-13% observed gains)
--   Exception: District 26 (Upper Thomson) +0% (rent declines observed)
--
-- Also updates lease_date from Dec-24 to Jan-26 to reflect the adjustment period.

BEGIN;

-- CCR districts: +4.5%
UPDATE properties
SET
  rental_price = ROUND(rental_price * 1.045),
  lease_date = 'Jan-26',
  updated_at = NOW()
WHERE district IN (1, 2, 4, 6, 9, 10, 11)
  AND lease_date = 'Dec-24';

-- RCR districts: +3.0%
UPDATE properties
SET
  rental_price = ROUND(rental_price * 1.030),
  lease_date = 'Jan-26',
  updated_at = NOW()
WHERE district IN (3, 5, 7, 8, 12, 13, 14, 15)
  AND lease_date = 'Dec-24';

-- OCR districts (general): +2.5%
UPDATE properties
SET
  rental_price = ROUND(rental_price * 1.025),
  lease_date = 'Jan-26',
  updated_at = NOW()
WHERE district IN (16, 17, 18, 19, 20, 22, 23, 24, 25, 27, 28)
  AND lease_date = 'Dec-24';

-- District 21 (Clementi, Upper Bukit Timah): +5.5% (stronger gains observed)
UPDATE properties
SET
  rental_price = ROUND(rental_price * 1.055),
  lease_date = 'Jan-26',
  updated_at = NOW()
WHERE district = 21
  AND lease_date = 'Dec-24';

-- District 26 (Upper Thomson, Mandai): +0% (flat/declining rents)
UPDATE properties
SET
  lease_date = 'Jan-26',
  updated_at = NOW()
WHERE district = 26
  AND lease_date = 'Dec-24';

-- Now refresh district summary stats from the updated property data
-- This recalculates avg_price, min_rent, max_rent, counts from actual records
UPDATE districts d
SET
  property_count = s.property_count,
  avg_price = s.avg_price,
  min_rent = s.min_rent,
  max_rent = s.max_rent,
  condo_count = s.condo_count,
  hdb_count = s.hdb_count,
  landed_count = s.landed_count,
  avg_size = s.avg_size,
  updated_at = NOW()
FROM (
  SELECT
    district,
    COUNT(*)::integer AS property_count,
    ROUND(AVG(rental_price))::numeric AS avg_price,
    MIN(rental_price)::numeric AS min_rent,
    MAX(rental_price)::numeric AS max_rent,
    COUNT(*) FILTER (WHERE property_type = 'Condo')::integer AS condo_count,
    COUNT(*) FILTER (WHERE property_type = 'HDB')::integer AS hdb_count,
    COUNT(*) FILTER (WHERE property_type = 'Landed')::integer AS landed_count,
    ROUND(AVG(sqft))::numeric AS avg_size
  FROM properties
  WHERE district IS NOT NULL
  GROUP BY district
) s
WHERE d.id = s.district;

COMMIT;
