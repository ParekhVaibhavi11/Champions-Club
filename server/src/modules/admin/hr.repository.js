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
