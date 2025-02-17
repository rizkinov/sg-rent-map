-- Add new columns and constraints
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_name text,
ADD COLUMN IF NOT EXISTS mrt text,
ADD COLUMN IF NOT EXISTS completion_year integer,
ADD COLUMN IF NOT EXISTS url text;

-- Update property_type enum if needed
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS property_type_check;

ALTER TABLE properties 
ADD CONSTRAINT property_type_check 
CHECK (property_type IN ('Condo', 'HDB', 'Landed')); 