import pool from '../../config/db.js';

export const getAllSports = async () => {
  const query = `
    SELECT 
      id, 
      name, 
      slug, 
      description, 
      icon_name, 
      is_active,
      (SELECT COUNT(*) FROM courts WHERE sport_id = sports.id AND is_active = TRUE) as court_count
    FROM sports
    WHERE is_active = TRUE
    ORDER BY id ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getCourtsBySportId = async (sportId = null) => {
  let query = `
    SELECT 
      c.id, 
      c.sport_id, 
      c.name, 
      c.surface_type, 
      c.hourly_rate_member, 
      c.hourly_rate_guest, 
      c.is_active,
      s.name as sport_name,
      s.slug as sport_slug
    FROM courts c
    JOIN sports s ON c.sport_id = s.id
    WHERE c.is_active = TRUE
  `;
  const params = [];
  if (sportId) {
    params.push(sportId);
    query += ` AND c.sport_id = $1`;
  }
  query += ` ORDER BY c.id ASC;`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const getCourtById = async (courtId) => {
  const query = `
    SELECT 
      c.id, 
      c.sport_id, 
      c.name, 
      c.surface_type, 
      c.hourly_rate_member, 
      c.hourly_rate_guest, 
      c.is_active,
      s.name as sport_name,
      s.slug as sport_slug
    FROM courts c
    JOIN sports s ON c.sport_id = s.id
    WHERE c.id = $1 AND c.is_active = TRUE;
  `;
  const result = await pool.query(query, [courtId]);
  return result.rows[0];
};

export const getCourtAllocationsForDate = async (courtId, dateStr) => {
  const query = `
    SELECT 
      id, 
      court_id, 
      slot_range, 
      lower(slot_range) as start_at, 
      upper(slot_range) as end_at, 
      type, 
      status
    FROM court_allocations
    WHERE court_id = $1
      AND status != 'CANCELLED'
      AND (lower(slot_range) AT TIME ZONE 'Asia/Kolkata')::DATE = $2::DATE;
  `;
  const result = await pool.query(query, [courtId, dateStr]);
  return result.rows;
};
