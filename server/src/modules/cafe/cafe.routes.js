import { Router } from 'express';
import { query, withTransaction } from '../../config/db.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const router = Router();

// 1. Get menu items
router.get('/menu', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT m.*, c.name as category_name
       FROM cafe_menu_items m
       JOIN cafe_categories c ON m.category_id = c.id
       WHERE m.is_available = TRUE
       ORDER BY m.category_id, m.id`
    );
    return successResponse(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// 2. Get tables & active orders
router.get('/tables', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT t.*,
              o.id as active_order_id, o.status as order_status, o.kitchen_status, o.total_amount,
              u.name as member_name
       FROM dining_tables t
       LEFT JOIN cafe_orders o ON t.id = o.table_id AND o.status = 'OPEN'
       LEFT JOIN users u ON o.member_id = u.id
       ORDER BY t.id ASC`
    );
    return successResponse(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// 3. Open or update café tab
router.post('/orders', authenticateToken, authorizeRole(['admin', 'front_desk', 'staff']), async (req, res, next) => {
  try {
    const { table_id, member_id, items } = req.body;
    const staff_id = req.user.id;

    if (!table_id || !items || !items.length) {
      return errorResponse(res, 'table_id and order items are required', 400);
    }

    const orderResult = await withTransaction(async (client) => {
      // Calculate item totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const mi = await client.query('SELECT * FROM cafe_menu_items WHERE id = $1', [item.menu_item_id]);
        if (mi.rows.length === 0) throw new Error(`Menu item ${item.menu_item_id} not found`);

        const price = parseFloat(mi.rows[0].price);
        const total = price * item.quantity;
        subtotal += total;

        orderItems.push({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: price,
          total_price: total,
          notes: item.notes || null
        });
      }

      // Member discount check (if applicable)
      let discountAmount = 0;
      if (member_id) {
        const mem = await client.query(
          `SELECT pl.discount_cafe_pct
           FROM memberships m
           JOIN membership_plans pl ON m.plan_id = pl.id
           WHERE m.user_id = $1 AND m.status = 'ACTIVE'`,
          [member_id]
        );
        if (mem.rows.length > 0 && mem.rows[0].discount_cafe_pct > 0) {
          discountAmount = (subtotal * mem.rows[0].discount_cafe_pct) / 100;
        }
      }

      const totalAmount = subtotal - discountAmount;

      // Create new open tab
      const orderInsert = await client.query(
        `INSERT INTO cafe_orders (table_id, member_id, subtotal, discount_amount, total_amount, opened_by_staff_id, status, kitchen_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'OPEN', 'PENDING')
         RETURNING *`,
        [table_id, member_id || null, subtotal, discountAmount, totalAmount, staff_id]
      );

      const order = orderInsert.rows[0];

      // Mark table as OCCUPIED
      await client.query("UPDATE dining_tables SET status = 'OCCUPIED' WHERE id = $1", [table_id]);

      // Insert items
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO cafe_order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, item.menu_item_id, item.quantity, item.unit_price, item.total_price, item.notes]
        );
      }

      return order;
    });

    return successResponse(res, orderResult, 'Order sent to kitchen & tab opened', 201);
  } catch (err) {
    next(err);
  }
});

// 4. Kitchen queue: update preparation status
router.patch('/orders/:id/kitchen-status', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res, next) => {
  try {
    const { status } = req.body; // 'PENDING', 'PREPARING', 'READY', 'SERVED'
    const result = await query(
      'UPDATE cafe_orders SET kitchen_status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, result.rows[0], 'Kitchen status updated');
  } catch (err) {
    next(err);
  }
});

// 5. Settle Tab (Simulated Cash/Card/UPI)
router.post('/orders/:id/settle', authenticateToken, authorizeRole(['admin', 'front_desk', 'staff']), async (req, res, next) => {
  try {
    const { payment_method = 'UPI' } = req.body;
    const orderId = req.params.id;

    const settledOrder = await withTransaction(async (client) => {
      const orderRes = await client.query("SELECT * FROM cafe_orders WHERE id = $1 AND status = 'OPEN'", [orderId]);
      if (orderRes.rows.length === 0) throw new Error('Open order not found or already settled');

      const order = orderRes.rows[0];

      // Settle order
      await client.query("UPDATE cafe_orders SET status = 'SETTLED', settled_at = NOW() WHERE id = $1", [orderId]);

      // Free dining table
      if (order.table_id) {
        await client.query("UPDATE dining_tables SET status = 'AVAILABLE' WHERE id = $1", [order.table_id]);
      }

      // Record payment
      await client.query(
        `INSERT INTO payments (source_type, source_id, amount, payment_method, transaction_ref, collected_by_staff_id)
         VALUES ('CAFE', $1, $2, $3, $4, $5)`,
        [order.id, order.total_amount, payment_method, `SIM-CAFE-${Date.now()}`, req.user.id]
      );

      return order;
    });

    return successResponse(res, settledOrder, 'Café bill settled successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
