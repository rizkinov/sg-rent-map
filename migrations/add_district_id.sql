-- Add district_id column
ALTER TABLE properties
ADD COLUMN district_id INTEGER;

-- Update existing properties with district_id based on their lat/lng
UPDATE properties p
SET district_id = (
  CASE 
    -- District 1: Raffles Place, Marina, Cecil
    WHEN p.latitude BETWEEN 1.2780 AND 1.2880 
    AND p.longitude BETWEEN 103.8461 AND 103.8561 THEN 1
    
    -- District 2: Tanjong Pagar, Chinatown
    WHEN p.latitude BETWEEN 1.2714 AND 1.2814 
    AND p.longitude BETWEEN 103.8396 AND 103.8496 THEN 2
    
    -- District 3: Tiong Bahru, Alexandra, Queenstown
    WHEN p.latitude BETWEEN 1.2828 AND 1.2928 
    AND p.longitude BETWEEN 103.8270 AND 103.8370 THEN 3
    
    -- Add more district conditions here...
    
    -- Default to null if no match
    ELSE NULL
  END
);

-- Add foreign key constraint (optional)
ALTER TABLE properties
ADD CONSTRAINT fk_district
FOREIGN KEY (district_id)
REFERENCES districts(id); 