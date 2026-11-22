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

export const getAllPlansForAdmin = async () => {
  const result = await pool.query(`
    SELECT id, name, tier, monthly_fee, court_discount_pct, shop_discount_pct,
           cafe_discount_pct, free_court_hours_per_month, max_daily_sessions,
           description, is_active
    FROM membership_plans
    ORDER BY monthly_fee DESC, name;
  `);
  return result.rows;
};

export const createMembershipPlan = async (plan) => {
  const result = await pool.query(`
    INSERT INTO membership_plans (
      name, tier, monthly_fee, court_discount_pct, shop_discount_pct,
      cafe_discount_pct, free_court_hours_per_month, max_daily_sessions,
      description, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, name, tier, monthly_fee, court_discount_pct, shop_discount_pct,
              cafe_discount_pct, free_court_hours_per_month, max_daily_sessions,
              description, is_active;
  `, [plan.name, plan.tier, plan.monthly_fee, plan.court_discount_pct, plan.shop_discount_pct,
      plan.cafe_discount_pct, plan.free_court_hours_per_month, plan.max_daily_sessions,
      plan.description, plan.is_active]);
  return result.rows[0];
};

export const updateMembershipPlan = async (planId, plan) => {
  const result = await pool.query(`
    UPDATE membership_plans SET
      name = $2, tier = $3, monthly_fee = $4, court_discount_pct = $5,
      shop_discount_pct = $6, cafe_discount_pct = $7,
      free_court_hours_per_month = $8, max_daily_sessions = $9,
      description = $10, is_active = $11
    WHERE id = $1
    RETURNING id, name, tier, monthly_fee, court_discount_pct, shop_discount_pct,
              cafe_discount_pct, free_court_hours_per_month, max_daily_sessions,
              description, is_active;
  `, [planId, plan.name, plan.tier, plan.monthly_fee, plan.court_discount_pct,
      plan.shop_discount_pct, plan.cafe_discount_pct, plan.free_court_hours_per_month,
      plan.max_daily_sessions, plan.description, plan.is_active]);
  return result.rows[0] || null;
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
      p.monthly_fee,
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

export const assignPlanToExistingMember = async ({ userId, planId, durationMonths, action }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const memberResult = await client.query(
      `SELECT u.id
       FROM users u
       JOIN member_profiles mp ON mp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'member'
       FOR UPDATE OF u`,
      [userId]
    );
    if (!memberResult.rows[0]) {
      const error = new Error('Member not found');
      error.statusCode = 404;
      throw error;
    }

    const activeResult = await client.query(
      `SELECT m.id, m.plan_id, p.monthly_fee
       FROM memberships m
       JOIN membership_plans p ON p.id = m.plan_id
       WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND m.end_date >= CURRENT_DATE
       ORDER BY m.end_date DESC
       LIMIT 1
       FOR UPDATE OF m`,
      [userId]
    );
    const activeMembership = activeResult.rows[0];

    if (action === 'CHOOSE' && activeMembership) {
      const error = new Error('This member already has an active plan. Use the upgrade or extend action.');
      error.statusCode = 409;
      throw error;
    }
    if (action === 'UPGRADE' && !activeMembership) {
      const error = new Error('This member has no active plan to upgrade. Choose a plan instead.');
      error.statusCode = 409;
      throw error;
    }

    if (action === 'UPGRADE') {
      const targetResult = await client.query(
        'SELECT monthly_fee FROM membership_plans WHERE id = $1 AND is_active = TRUE',
        [planId]
      );
      if (!targetResult.rows[0] || Number(targetResult.rows[0].monthly_fee) <= Number(activeMembership.monthly_fee)) {
        const error = new Error('Upgrade must use a plan with a higher monthly fee.');
        error.statusCode = 400;
        throw error;
      }
    }

    await client.query(
      `UPDATE memberships
       SET status = CASE WHEN end_date < CURRENT_DATE THEN 'EXPIRED'::membership_status ELSE 'CANCELLED'::membership_status END
       WHERE user_id = $1 AND status = 'ACTIVE'`,
      [userId]
    );

    const result = await client.query(
      `INSERT INTO memberships (user_id, plan_id, start_date, end_date, status, auto_renew)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + ($3 || ' months')::INTERVAL, 'ACTIVE', TRUE)
       RETURNING id, user_id, plan_id, start_date, end_date, status`,
      [userId, planId, durationMonths]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const purchaseMembership = async ({ userId, planId, durationMonths, paymentMethod }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const memberResult = await client.query(
      `SELECT u.id, u.full_name, u.email, mp.date_of_birth
       FROM users u JOIN member_profiles mp ON mp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'member'
       FOR UPDATE OF u`,
      [userId]
    );
    const member = memberResult.rows[0];
    if (!member) throw Object.assign(new Error('Member account not found.'), { statusCode: 404 });

    const activeResult = await client.query(
      `SELECT id FROM memberships
       WHERE user_id = $1 AND status = 'ACTIVE' AND end_date >= CURRENT_DATE
       ORDER BY end_date DESC LIMIT 1 FOR UPDATE`,
      [userId]
    );
    if (activeResult.rows[0]) {
      throw Object.assign(new Error('You already have an active membership. Contact the front desk to extend or change your plan.'), { statusCode: 409 });
    }

    const planResult = await client.query(
      'SELECT id, name, tier, monthly_fee FROM membership_plans WHERE id = $1 AND is_active = TRUE',
      [planId]
    );
    const plan = planResult.rows[0];
    if (!plan) throw Object.assign(new Error('Selected membership plan is unavailable.'), { statusCode: 400 });
    if (plan.tier === 'JUNIOR' && member.date_of_birth) {
      const birthDate = new Date(member.date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age >= 18) throw Object.assign(new Error('Junior membership is only available to athletes under 18.'), { statusCode: 400 });
    }

    const membershipResult = await client.query(
      `INSERT INTO memberships (user_id, plan_id, start_date, end_date, status, auto_renew)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + ($3 || ' months')::INTERVAL, 'ACTIVE', FALSE)
       RETURNING id, start_date, end_date, status`,
      [userId, planId, durationMonths]
    );
    const membership = membershipResult.rows[0];
    const total = Number(plan.monthly_fee) * durationMonths;
    const stamp = Date.now();
    const invoiceNo = `INV-MEM-${membership.id}-${stamp}`;
    const invoiceResult = await client.query(
      `INSERT INTO invoices (invoice_no, user_id, source_type, source_id, subtotal, total_amount, status)
       VALUES ($1, $2, 'MEMBERSHIP', $3, $4, $4, 'PAID') RETURNING id`,
      [invoiceNo, userId, membership.id, total]
    );
    const paymentNo = `PAY-MEM-${membership.id}-${stamp}`;
    await client.query(
      `INSERT INTO payments (payment_no, invoice_id, source_type, source_id, amount, payment_method, status)
       VALUES ($1, $2, 'MEMBERSHIP', $3, $4, $5, 'SUCCESS')`,
      [paymentNo, invoiceResult.rows[0].id, membership.id, total, paymentMethod]
    );
    await client.query('COMMIT');
    return {
      user_id: userId,
      customer_name: member.full_name,
      customer_email: member.email,
      membership_id: membership.id,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_tier: plan.tier,
      duration_months: durationMonths,
      monthly_fee: Number(plan.monthly_fee),
      subtotal: total,
      total_amount: total,
      payment_method: paymentMethod,
      payment_no: paymentNo,
      invoice_id: invoiceResult.rows[0].id,
      invoice_no: invoiceNo,
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: 'PAID',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateMembershipReceiptEmailStatus = async (invoiceId, status) => {
  const result = await pool.query(
    `UPDATE invoices
     SET receipt_email_status = $2,
         receipt_emailed_at = CASE WHEN $2 = 'SENT' THEN NOW() ELSE receipt_emailed_at END
     WHERE id = $1
     RETURNING receipt_email_status, receipt_emailed_at`,
    [invoiceId, status]
  );
  return result.rows[0];
};
