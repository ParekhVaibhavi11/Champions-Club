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

export const savePasswordResetOTP = async (userId, otpCode, token, expiresAt) => {
  // Invalidate any existing unused reset tokens for this user
  await pool.query('UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE', [userId]);

  const query = `
    INSERT INTO password_resets (user_id, otp_code, token, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, otp_code, token, expires_at;
  `;
  const result = await pool.query(query, [userId, otpCode, token, expiresAt]);
  return result.rows[0];
};

export const resetPasswordWithOTP = async (email, otpCode, newPasswordHash) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      SELECT pr.id, pr.user_id
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      WHERE LOWER(u.email) = LOWER($1)
        AND pr.otp_code = $2
        AND pr.used = FALSE
        AND pr.expires_at > NOW()
      ORDER BY pr.id DESC
      LIMIT 1
      FOR UPDATE;
    `;
    const res = await client.query(query, [email, otpCode]);

    if (res.rows.length === 0) {
      throw new Error('Invalid or expired 6-digit verification code.');
    }

    const { id: resetId, user_id: userId } = res.rows[0];

    // Update password
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);

    // Mark OTP as used
    await client.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetId]);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
