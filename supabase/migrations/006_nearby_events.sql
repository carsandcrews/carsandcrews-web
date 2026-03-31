create or replace function nearby_events(
  user_lat numeric,
  user_lng numeric,
  radius_miles numeric default 150,
  max_results integer default 50
) returns table (
  id uuid,
  name text,
  slug text,
  event_type text,
  date date,
  end_date date,
  start_time time,
  end_time time,
  city text,
  state text,
  lat numeric,
  lng numeric,
  banner_url text,
  location_name text,
  is_free_spectator boolean,
  admission_fee_text text,
  distance_miles numeric
) as $$
  select
    e.id, e.name, e.slug, e.event_type, e.date, e.end_date,
    e.start_time, e.end_time, e.city, e.state, e.lat, e.lng,
    e.banner_url, e.location_name, e.is_free_spectator, e.admission_fee_text,
    round((3959 * acos(
      cos(radians(user_lat)) * cos(radians(e.lat)) *
      cos(radians(e.lng) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(e.lat))
    ))::numeric, 1) as distance_miles
  from events e
  where e.status = 'published'
    and e.date >= current_date
    and e.lat is not null and e.lng is not null
    and (3959 * acos(
      cos(radians(user_lat)) * cos(radians(e.lat)) *
      cos(radians(e.lng) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(e.lat))
    )) <= radius_miles
  order by e.date asc, distance_miles asc
  limit max_results;
$$ language sql stable;
