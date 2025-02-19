-- Add a unique constraint to prevent duplicate property IDs
ALTER TABLE properties
ADD CONSTRAINT unique_property_id UNIQUE (id);

-- Optionally, remove any existing duplicates before adding the constraint
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
  FROM properties
)
DELETE FROM properties
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
); 