-- Add new columns for government data
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS street_name text,
ADD COLUMN IF NOT EXISTS lease_date text;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_properties_lease_date ON properties(lease_date); 