-- Ensure all required columns exist with correct types
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_name text,
ADD COLUMN IF NOT EXISTS property_type text CHECK (property_type IN ('Condo', 'HDB', 'Landed')),
ADD COLUMN IF NOT EXISTS district integer,
ADD COLUMN IF NOT EXISTS rental_price integer NOT NULL,
ADD COLUMN IF NOT EXISTS beds integer,
ADD COLUMN IF NOT EXISTS baths integer,
ADD COLUMN IF NOT EXISTS sqft numeric NOT NULL,
ADD COLUMN IF NOT EXISTS mrt text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS street_name text,
ADD COLUMN IF NOT EXISTS lease_date text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_rental_price ON properties(rental_price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude); 