import pool from '../../config/db.js';

export const getDashboardSummary = async () => {
  const [revenue, bookings, courts, members, cafe, stock] = await Promise.all([
    pool.query(`SELECT COALESCE(SUM(amount), 0) AS today_revenue FROM payments WHERE status = 'SUCCESS' AND created_at::date = CURRENT_DATE`),
    pool.query(`SELECT COUNT(*) AS count FROM bookings b JOIN court_allocations ca ON ca.id = b.allocation_id WHERE ca.status = 'CONFIRMED' AND (lower(ca.slot_range) AT TIME ZONE 'Asia/Kolkata')::date = CURRENT_DATE`),
    pool.query(`SELECT COUNT(*) AS count FROM courts WHERE is_active = TRUE`),
    pool.query(`SELECT COUNT(DISTINCT user_id) AS count FROM memberships WHERE status = 'ACTIVE' AND end_date >= CURRENT_DATE`),
    pool.query(`SELECT COUNT(*) AS count FROM cafe_orders WHERE status = 'OPEN'`),
    pool.query(`SELECT COUNT(*) AS count FROM inventory WHERE quantity <= low_stock_threshold`),
  ]);
  return {
    today_revenue: Number(revenue.rows[0].today_revenue),
    today_bookings: Number(bookings.rows[0].count),
    active_courts: Number(courts.rows[0].count),
    active_memberships: Number(members.rows[0].count),
    open_cafe_tabs: Number(cafe.rows[0].count),
    low_stock_products: Number(stock.rows[0].count),
  };
};

export const getRevenueByDepartment = async (from, to) => {
  const result = await pool.query(`
    SELECT source_type AS department, COUNT(*) AS payment_count, COALESCE(SUM(amount), 0) AS revenue
    FROM payments
    WHERE status = 'SUCCESS' AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
    GROUP BY source_type ORDER BY revenue DESC;
  `, [from, to]);
  return result.rows;
};

export const getPaymentLedger = async (from, to) => {
  const result = await pool.query(`
    SELECT p.id, p.payment_no, p.source_type, p.source_id, p.amount,
           p.payment_method, p.status, p.transaction_ref, p.created_at,
           p.invoice_id, i.invoice_no, i.receipt_email_status, i.receipt_emailed_at,
           collector.full_name AS collected_by, customer.full_name AS customer_name,
           plan.name AS membership_plan_name, plan.tier AS membership_tier
    FROM payments p
    LEFT JOIN invoices i ON i.id = p.invoice_id
    LEFT JOIN users collector ON collector.id = p.collected_by_id
    LEFT JOIN users customer ON customer.id = i.user_id
    LEFT JOIN memberships m ON p.source_type = 'MEMBERSHIP' AND m.id = p.source_id
    LEFT JOIN membership_plans plan ON plan.id = m.plan_id
    WHERE p.created_at >= $1::date AND p.created_at < ($2::date + INTERVAL '1 day')
    ORDER BY p.created_at DESC;
  `, [from, to]);
  return result.rows;
};
