-- Add missing columns and fix constraints
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS baths integer,
ADD COLUMN IF NOT EXISTS beds integer CHECK (beds >= 0),
ALTER COLUMN rental_price SET NOT NULL,
ALTER COLUMN sqft SET NOT NULL;

-- Update indices
CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);
CREATE INDEX IF NOT EXISTS idx_properties_baths ON properties(baths); 