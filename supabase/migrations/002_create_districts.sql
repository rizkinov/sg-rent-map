create table districts (
  id integer primary key,
  name text not null,
  region text not null,
  center_lat numeric not null,
  center_lng numeric not null,
  property_count integer default 0,
  avg_price numeric default 0,
  min_rent numeric default 0,
  max_rent numeric default 0,
  condo_count integer default 0,
  hdb_count integer default 0,
  landed_count integer default 0,
  avg_size numeric default 0,
  top_properties jsonb[] default array[]::jsonb[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insert sample data
insert into districts (
  id, name, region, center_lat, center_lng,
  property_count, avg_price,
  condo_count, hdb_count, landed_count,
  min_price, max_price, avg_size
) values
  (1, 'Raffles Place, Marina, Cecil', 'Central', 1.2830, 103.8511, 
   156, 5200, 89, 45, 22, 3500, 8900, 950),
  (2, 'Tanjong Pagar, Chinatown', 'Central', 1.2764, 103.8446,
   142, 4800, 95, 38, 9, 3200, 7800, 880);

-- Create a function to update district statistics
create or replace function update_district_stats()
returns trigger as $$
begin
  -- Update district statistics when properties change
  with district_stats as (
    select
      count(*) as property_count,
      avg(rental_price) as avg_price,
      count(*) filter (where property_type = 'Condo') as condo_count,
      count(*) filter (where property_type = 'HDB') as hdb_count,
      count(*) filter (where property_type = 'Landed') as landed_count,
      min(rental_price) as min_price,
      max(rental_price) as max_price,
      avg(sqft) as avg_size
    from properties
    where district_id = NEW.district_id
  )
  update districts
  set
    property_count = district_stats.property_count,
    avg_price = district_stats.avg_price,
    condo_count = district_stats.condo_count,
    hdb_count = district_stats.hdb_count,
    landed_count = district_stats.landed_count,
    min_price = district_stats.min_price,
    max_price = district_stats.max_price,
    avg_size = district_stats.avg_size,
    updated_at = now()
  from district_stats
  where districts.id = NEW.district_id;
  
  return NEW;
end;
$$ language plpgsql;

-- Create trigger to update district stats
create trigger update_district_stats_trigger
after insert or update or delete on properties
for each row execute function update_district_stats(); 