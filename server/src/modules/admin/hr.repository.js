import pool from '../../config/db.js';

export const getEmployees = async () => {
  const result = await pool.query(`SELECT e.id, e.user_id, u.full_name, u.email, u.phone, e.job_title, e.department, e.monthly_salary, e.hire_date, e.is_active FROM employees e JOIN users u ON u.id = e.user_id ORDER BY e.department, u.full_name`);
  return result.rows;
};

export const getShifts = async () => {
  const result = await pool.query(`SELECT s.id, s.employee_id, u.full_name, e.department, s.clock_in, s.clock_out, s.shift_type, s.cash_drawer_start, s.cash_drawer_end FROM shifts s JOIN employees e ON e.id = s.employee_id JOIN users u ON u.id = e.user_id ORDER BY s.clock_in DESC LIMIT 100`);
  return result.rows;
};

export const getLeaveRequests = async () => {
  const result = await pool.query(`SELECT l.id, l.employee_id, u.full_name, e.department, l.leave_type, l.start_date, l.end_date, l.reason, l.status, l.created_at FROM leave_requests l JOIN employees e ON e.id = l.employee_id JOIN users u ON u.id = e.user_id ORDER BY (l.status = 'PENDING') DESC, l.created_at DESC`);
  return result.rows;
};

export const updateLeaveStatus = async (id, status, adminId) => {
  const result = await pool.query(`UPDATE leave_requests SET status = $2, reviewed_by_id = $3 WHERE id = $1 AND status = 'PENDING' RETURNING id, status, reviewed_by_id`, [id, status, adminId]);
  return result.rows[0];
};

export const createStaffEmployee = async ({ fullName, email, phone, role, department, jobTitle, monthlySalary, passwordHash }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create User
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, phone, role, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, role, created_at;`,
      [fullName, email.toLowerCase(), phone || null, role, passwordHash]
    );
    const newUser = userResult.rows[0];

    // 2. Create staff_profiles row with appropriate flags
    const canAccessPos = department === 'shop' || department === 'cafe' || role === 'front_desk';
    const canAccessKitchen = department === 'kitchen';
    await client.query(
      `INSERT INTO staff_profiles (user_id, department, can_access_pos, can_access_kitchen, hourly_wage, hire_date, is_active)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, TRUE)
       ON CONFLICT (user_id) DO NOTHING;`,
      [newUser.id, department, canAccessPos, canAccessKitchen, monthlySalary ? monthlySalary / 160 : 0]
    );

    // 3. Create employees record
    const empResult = await client.query(
      `INSERT INTO employees (user_id, job_title, department, monthly_salary, hire_date, is_active)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, TRUE)
       RETURNING id, job_title, department, monthly_salary, hire_date, is_active;`,
      [newUser.id, jobTitle || 'Staff Member', department, monthlySalary || 0]
    );

    await client.query('COMMIT');
    return {
      ...newUser,
      employee_id: empResult.rows[0].id,
      job_title: empResult.rows[0].job_title,
      department: empResult.rows[0].department,
      monthly_salary: empResult.rows[0].monthly_salary,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
