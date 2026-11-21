import pool from '../../config/db.js';

export const getAllPlans = async () => {
  const query = `
    SELECT 
      id, 
      name, 
      tier, 
      monthly_fee, 
      court_discount_pct, 
      shop_discount_pct, 
      cafe_discount_pct, 
      free_court_hours_per_month, 
      max_daily_sessions, 
      description, 
      is_active
    FROM membership_plans
    WHERE is_active = TRUE
    ORDER BY monthly_fee DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getPlanById = async (planId) => {
  const query = `
    SELECT * FROM membership_plans WHERE id = $1 AND is_active = TRUE;
  `;
  const result = await pool.query(query, [planId]);
  return result.rows[0];
};

export const searchMembers = async (search = '') => {
  let query = `
    SELECT 
      u.id as user_id,
      u.full_name,
      u.email,
      u.phone,
      u.role,
      u.created_at as joined_at,
      mp.member_code,
      mp.date_of_birth,
      mp.emergency_contact,
      mp.emergency_phone,
      m.id as membership_id,
      m.start_date,
      m.end_date,
      m.status as membership_status,
      m.auto_renew,
      p.id as plan_id,
      p.name as plan_name,
      p.tier as plan_tier,
      p.court_discount_pct,
      p.shop_discount_pct,
      p.cafe_discount_pct
    FROM users u
    JOIN member_profiles mp ON u.id = mp.user_id
    LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'ACTIVE' AND m.end_date >= CURRENT_DATE
    LEFT JOIN membership_plans p ON m.plan_id = p.id
    WHERE u.role = 'member'
  `;

  const params = [];
  if (search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += `
      AND (
        LOWER(u.full_name) LIKE $1 OR
        LOWER(u.email) LIKE $1 OR
        LOWER(u.phone) LIKE $1 OR
        LOWER(mp.member_code) LIKE $1
      )
    `;
  }

  query += ` ORDER BY u.id DESC;`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const getMemberDetailsById = async (userId) => {
  const query = `
    SELECT 
      u.id as user_id,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      u.created_at as joined_at,
      mp.member_code,
      mp.date_of_birth,
      mp.emergency_contact,
      mp.emergency_phone,
      mp.address,
      m.id as membership_id,
      m.start_date,
      m.end_date,
      m.status as membership_status,
      m.auto_renew,
      p.id as plan_id,
      p.name as plan_name,
      p.tier as plan_tier,
      p.monthly_fee,
      p.court_discount_pct,
      p.shop_discount_pct,
      p.cafe_discount_pct,
      p.free_court_hours_per_month
    FROM users u
    JOIN member_profiles mp ON u.id = mp.user_id
    LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'ACTIVE' AND m.end_date >= CURRENT_DATE
    LEFT JOIN membership_plans p ON m.plan_id = p.id
    WHERE u.id = $1
    LIMIT 1;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

export const createMemberTransaction = async ({ fullName, email, phone, passwordHash, dateOfBirth, emergencyContact, emergencyPhone, address, planId, durationMonths = 12 }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert user
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'member')
       RETURNING id, full_name, email, phone;`,
      [fullName, email, phone, passwordHash]
    );
    const user = userRes.rows[0];

    // 2. Fetch plan to construct member code
    const planRes = planId
      ? await client.query('SELECT tier FROM membership_plans WHERE id = $1', [planId])
      : { rows: [] };
    const tier = planRes.rows[0]?.tier || 'MEMBER';

    // Random unique member code e.g. CC-GOLD-482
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const memberCode = `CC-${tier}-${randomSuffix}`;

    // 3. Insert member profile
    await client.query(
      `INSERT INTO member_profiles (user_id, member_code, date_of_birth, emergency_contact, emergency_phone, address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [user.id, memberCode, dateOfBirth || null, emergencyContact || null, emergencyPhone || null, address || null]
    );

    let membership = null;
    if (planId) {
      // 4. Create a membership only when a plan was selected.
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(durationMonths, 10));
      const membershipRes = await client.query(
        `INSERT INTO memberships (user_id, plan_id, start_date, end_date, status, auto_renew)
         VALUES ($1, $2, $3, $4, 'ACTIVE', TRUE)
         RETURNING id, plan_id, start_date, end_date, status;`,
        [user.id, planId, startDate, endDate]
      );
      membership = membershipRes.rows[0];
    }

    await client.query('COMMIT');

    return {
      user,
      memberCode,
      membership,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const extendMembership = async (membershipId, monthsToAdd = 1) => {
  const query = `
    UPDATE memberships
    SET 
      end_date = end_date + ($2 || ' months')::INTERVAL,
      status = 'ACTIVE'
    WHERE id = $1
    RETURNING id, user_id, plan_id, start_date, end_date, status;
  `;
  const result = await pool.query(query, [membershipId, monthsToAdd]);
  return result.rows[0];
};
