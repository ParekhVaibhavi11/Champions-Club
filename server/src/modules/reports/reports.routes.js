import { Router } from 'express';
import { query } from '../../config/db.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';
import { successResponse } from '../../utils/apiResponse.js';

const router = Router();

// Admin KPI Summary
router.get('/summary', authenticateToken, authorizeRole(['admin']), async (req, res, next) => {
  try {
    // 1. Total revenue aggregated by source
    const revenueRes = await query(
      `SELECT source_type, SUM(amount) as total_amount
       FROM payments
       WHERE status = 'SUCCESS'
       GROUP BY source_type`
    );

    // 2. Active bookings today
    const bookingsToday = await query(
      `SELECT COUNT(*) as count
       FROM court_allocations
       WHERE status = 'CONFIRMED'
         AND slot_range && tstzrange(CURRENT_DATE::timestamptz, (CURRENT_DATE + 1)::timestamptz)`
    );

    // 3. Low stock inventory alerts
    const lowStockAlerts = await query(
      `SELECT p.name, p.sku, i.quantity, i.low_stock_threshold
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       WHERE i.quantity <= i.low_stock_threshold`
    );

    // 4. Open café tabs
    const openTabs = await query(
      `SELECT COUNT(*) as open_tabs_count, COALESCE(SUM(total_amount), 0) as tab_value
       FROM cafe_orders
       WHERE status = 'OPEN'`
    );

    return successResponse(res, {
      revenueByDepartment: revenueRes.rows,
      activeBookingsToday: parseInt(bookingsToday.rows[0].count, 10),
      lowStockProducts: lowStockAlerts.rows,
      openCafeTabs: openTabs.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
