-- Drop and recreate the properties table with the correct schema
DROP TABLE IF EXISTS properties;

CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name text NOT NULL,
  property_type text CHECK (property_type IN ('Condo', 'HDB', 'Landed')),
  district integer,
  rental_price integer NOT NULL,
  beds integer,
  baths integer,
  sqft numeric NOT NULL,
  mrt text,
  latitude numeric,
  longitude numeric,
  completion_year integer,
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indices for better query performance
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_rental_price ON properties(rental_price);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 