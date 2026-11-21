import { Router } from 'express';
import { query, withTransaction } from '../../config/db.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const router = Router();

// 1. Public / Member: Browse products catalog with real-time stock
// NOTE: Gear shop items can only be bought IN-PERSON at the physical club counter!
router.get('/products', async (req, res, next) => {
  try {
    const { category_id } = req.query;
    let sql = `
      SELECT p.*, c.name as category_name, i.quantity as stock_quantity,
             CASE WHEN i.quantity > 0 THEN true ELSE false END as in_stock
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = $1';
      params.push(category_id);
    }

    sql += ' ORDER BY p.id ASC';
    const result = await query(sql, params);
    return successResponse(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// 2. Staff POS Counter: Create in-person order (Atomic stock deduction)
router.post('/orders', authenticateToken, authorizeRole(['admin', 'front_desk', 'staff']), async (req, res, next) => {
  try {
    const { customer_id, items, payment_method = 'CARD' } = req.body;
    const cashier_id = req.user.id;

    if (!items || !items.length) {
      return errorResponse(res, 'Order must contain at least one item', 400);
    }

    const orderResult = await withTransaction(async (client) => {
      let subtotal = 0;
      const orderItemsToInsert = [];

      // Calculate total & deduct stock atomically with guard
      for (const item of items) {
        const prod = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
        if (prod.rows.length === 0) throw new Error(`Product ID ${item.product_id} not found`);

        const price = parseFloat(customer_id ? prod.rows[0].member_price : prod.rows[0].retail_price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        // Atomic inventory check and decrease
        const invUpdate = await client.query(
          `UPDATE inventory
           SET quantity = quantity - $1, updated_at = NOW()
           WHERE product_id = $2 AND quantity >= $1
           RETURNING quantity`,
          [item.quantity, item.product_id]
        );

        if (invUpdate.rows.length === 0) {
          throw new Error(`Insufficient inventory for product: ${prod.rows[0].name}`);
        }

        orderItemsToInsert.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: price,
          total_price: itemTotal
        });
      }

      const receiptNo = `REC-SHP-${Date.now()}`;
      const totalAmount = subtotal;

      const orderInsert = await client.query(
        `INSERT INTO shop_orders (receipt_no, customer_id, cashier_id, subtotal, discount_amount, total_amount, payment_status)
         VALUES ($1, $2, $3, $4, 0, $5, 'PAID')
         RETURNING *`,
        [receiptNo, customer_id || null, cashier_id, subtotal, totalAmount]
      );

      const order = orderInsert.rows[0];

      for (const item of orderItemsToInsert) {
        await client.query(
          `INSERT INTO shop_order_items (order_id, product_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.quantity, item.unit_price, item.total_price]
        );
      }

      // Record in demo payments ledger
      await client.query(
        `INSERT INTO payments (source_type, source_id, amount, payment_method, transaction_ref, collected_by_staff_id)
         VALUES ('SHOP', $1, $2, $3, $4, $5)`,
        [order.id, totalAmount, payment_method, `SIM-TXN-${Date.now()}`, cashier_id]
      );

      return order;
    });

    return successResponse(res, orderResult, 'Shop order completed successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
