import pool from '../../config/db.js';

export const findUserByEmail = async (email) => {
  const query = `
    SELECT 
      u.id, 
      u.email, 
      u.password_hash, 
      u.full_name, 
      u.phone, 
      u.role, 
      u.avatar_url,
      sp.department as staff_department,
      sp.can_access_pos,
      sp.can_access_kitchen,
      mp.member_code,
      m.id as membership_id,
      m.status as membership_status,
      mp_plan.tier as membership_tier,
      mp_plan.court_discount_pct,
      mp_plan.shop_discount_pct,
      mp_plan.cafe_discount_pct
    FROM users u
    LEFT JOIN staff_profiles sp ON u.id = sp.user_id
    LEFT JOIN member_profiles mp ON u.id = mp.user_id
    LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'ACTIVE'
    LEFT JOIN membership_plans mp_plan ON m.plan_id = mp_plan.id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const query = `
    SELECT 
      u.id, 
      u.email, 
      u.full_name, 
      u.phone, 
      u.role, 
      u.avatar_url,
      sp.department as staff_department,
      sp.can_access_pos,
      sp.can_access_kitchen,
      mp.member_code,
      m.id as membership_id,
      m.status as membership_status,
      mp_plan.name as membership_plan_name,
      mp_plan.tier as membership_tier,
      mp_plan.court_discount_pct,
      mp_plan.shop_discount_pct,
      mp_plan.cafe_discount_pct
    FROM users u
    LEFT JOIN staff_profiles sp ON u.id = sp.user_id
    LEFT JOIN member_profiles mp ON u.id = mp.user_id
    LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'ACTIVE'
    LEFT JOIN membership_plans mp_plan ON m.plan_id = mp_plan.id
    WHERE u.id = $1
    LIMIT 1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
