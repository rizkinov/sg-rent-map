-- Create function for property type distribution
CREATE OR REPLACE FUNCTION public.get_property_type_distribution()
RETURNS TABLE (
  property_type text,
  count bigint
) 
LANGUAGE SQL
AS $$
  SELECT 
    property_type,
    COUNT(*) as count
  FROM properties
  GROUP BY property_type
  ORDER BY count DESC;
$$;

-- Create function for district statistics
CREATE OR REPLACE FUNCTION public.get_district_statistics()
RETURNS TABLE (
  district integer,
  property_count bigint,
  avg_price numeric,
  min_price numeric,
  max_price numeric
)
LANGUAGE SQL
AS $$
  SELECT 
    district,
    COUNT(*) as property_count,
    ROUND(AVG(rental_price)) as avg_price,
    MIN(rental_price) as min_price,
    MAX(rental_price) as max_price
  FROM properties
  WHERE district IS NOT NULL
  GROUP BY district
  ORDER BY district;
$$; 