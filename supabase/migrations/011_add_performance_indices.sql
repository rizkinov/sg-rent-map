-- Add indices for common queries
CREATE INDEX IF NOT EXISTS idx_properties_rental_price ON properties(rental_price);
CREATE INDEX IF NOT EXISTS idx_properties_sqft ON properties(sqft);
CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);
CREATE INDEX IF NOT EXISTS idx_properties_district_type ON properties(district, property_type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);

-- Add GiST index for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
UPDATE properties SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
CREATE INDEX IF NOT EXISTS idx_properties_location_gist ON properties USING GIST(location); 