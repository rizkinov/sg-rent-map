-- Rename price column to rental_price
ALTER TABLE properties 
RENAME COLUMN price TO rental_price;

-- Add missing columns
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS beds integer,
ADD COLUMN IF NOT EXISTS baths integer,
ADD COLUMN IF NOT EXISTS district integer;

-- Add indices for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_rental_price ON properties(rental_price); 