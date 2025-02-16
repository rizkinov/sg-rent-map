create table properties (
  id uuid default gen_random_uuid() primary key,
  property_type text check (property_type in ('Condo', 'HDB', 'Landed')),
  sqft numeric not null,
  bedrooms integer not null,
  bathrooms integer not null,
  rental_price numeric not null,
  latitude numeric not null,
  longitude numeric not null,
  created_at timestamptz default now()
);

-- Create an index for location-based queries
create index properties_location_idx on properties using gist (
  ll_to_earth(latitude, longitude)
);

-- Optional: Add some sample data
insert into properties (property_type, sqft, bedrooms, bathrooms, rental_price, latitude, longitude) values
  ('Condo', 800, 2, 2, 3500, 1.3521, 103.8198),
  ('HDB', 1000, 3, 2, 2800, 1.3644, 103.8277),
  ('Landed', 2500, 4, 3, 8000, 1.3234, 103.8134); 