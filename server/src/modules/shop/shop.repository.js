import pool from '../../config/db.js';

export const listProducts = async () => {
  const result = await pool.query(`
    SELECT p.id, p.sku, p.name, p.description, p.retail_price, p.member_price,
           p.image_url, p.category_id, pc.name AS category_name,
           COALESCE(i.quantity, 0) AS stock_quantity,
           COALESCE(i.low_stock_threshold, 5) AS low_stock_threshold
    FROM products p
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE p.is_active = TRUE
    ORDER BY p.name;
  `);
  return result.rows;
};

export const getInventory = async () => {
  const result = await pool.query(`
    SELECT p.id AS product_id, p.sku, p.name, pc.name AS category_name,
           p.retail_price, i.quantity, i.low_stock_threshold, i.updated_at,
           CASE WHEN i.quantity = 0 THEN 'OUT_OF_STOCK'
                WHEN i.quantity <= i.low_stock_threshold THEN 'LOW_STOCK'
                ELSE 'IN_STOCK' END AS stock_status
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    WHERE p.is_active = TRUE
    ORDER BY (i.quantity <= i.low_stock_threshold) DESC, p.name;
  `);
  return result.rows;
};

export const getStockMovements = async () => {
  const result = await pool.query(`
    SELECT sm.id, sm.product_id, p.name AS product_name, p.sku,
           sm.change_qty, sm.balance_qty, sm.movement_type, sm.notes,
           u.full_name AS recorded_by, sm.created_at
    FROM stock_movements sm JOIN products p ON p.id = sm.product_id
    LEFT JOIN users u ON u.id = sm.recorded_by_id
    ORDER BY sm.created_at DESC LIMIT 100;
  `);
  return result.rows;
};

export const adjustInventory = async ({ productId, changeQty, userId, notes }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await client.query(`
      UPDATE inventory SET quantity = quantity + $2, updated_at = NOW()
      WHERE product_id = $1 AND quantity + $2 >= 0
      RETURNING quantity;
    `, [productId, changeQty]);
    if (!updated.rows[0]) {
      const error = new Error('Product inventory was not found or the adjustment would make stock negative.');
      error.statusCode = 400;
      throw error;
    }
    await client.query(`
      INSERT INTO stock_movements (product_id, change_qty, balance_qty, movement_type, recorded_by_id, notes)
      VALUES ($1, $2, $3, 'ADJUSTMENT', $4, $5);
    `, [productId, changeQty, updated.rows[0].quantity, userId, notes || null]);
    await client.query('COMMIT');
    return { product_id: productId, quantity: updated.rows[0].quantity };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const createShopOrder = async ({ customerId, cashierId, paymentMethod, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let discountPct = 0;
    if (customerId) {
      const membership = await client.query(`
        SELECT p.shop_discount_pct FROM memberships m
        JOIN membership_plans p ON p.id = m.plan_id
        WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND m.end_date >= CURRENT_DATE
        ORDER BY m.end_date DESC LIMIT 1;
      `, [customerId]);
      discountPct = Number(membership.rows[0]?.shop_discount_pct || 0);
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const productResult = await client.query(`
        SELECT id, name, retail_price FROM products WHERE id = $1 AND is_active = TRUE FOR UPDATE;
      `, [item.product_id]);
      const product = productResult.rows[0];
      if (!product) {
        const error = new Error(`Product ${item.product_id} is unavailable.`);
        error.statusCode = 400;
        throw error;
      }
      const stockResult = await client.query(`
        UPDATE inventory SET quantity = quantity - $2, updated_at = NOW()
        WHERE product_id = $1 AND quantity >= $2 RETURNING quantity;
      `, [product.id, item.quantity]);
      if (!stockResult.rows[0]) {
        const error = new Error(`Insufficient stock for ${product.name}.`);
        error.statusCode = 409;
        throw error;
      }
      const unitPrice = Number(product.retail_price) * (1 - discountPct / 100);
      const lineTotal = unitPrice * item.quantity;
      subtotal += Number(product.retail_price) * item.quantity;
      orderItems.push({ product, quantity: item.quantity, unitPrice, lineTotal, balance: stockResult.rows[0].quantity });
    }

    const discountAmount = subtotal * discountPct / 100;
    const totalAmount = subtotal - discountAmount;
    const receiptNo = `GEAR-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const orderResult = await client.query(`
      INSERT INTO shop_orders (receipt_no, customer_id, cashier_id, subtotal, discount_amount, total_amount, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, receipt_no, customer_id, subtotal, discount_amount, total_amount, payment_method, created_at;
    `, [receiptNo, customerId || null, cashierId, subtotal, discountAmount, totalAmount, paymentMethod]);
    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(`
        INSERT INTO shop_order_items (order_id, product_id, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5);
      `, [order.id, item.product.id, item.quantity, item.unitPrice, item.lineTotal]);
      await client.query(`
        INSERT INTO stock_movements (product_id, change_qty, balance_qty, movement_type, reference_id, recorded_by_id, notes)
        VALUES ($1, $2, $3, 'POS_SALE', $4, $5, $6);
      `, [item.product.id, -item.quantity, item.balance, order.id, cashierId, receiptNo]);
    }

    const invoiceNo = `INV-GEAR-${order.id}-${Date.now()}`;
    const invoice = await client.query(`
      INSERT INTO invoices (invoice_no, user_id, source_type, source_id, subtotal, total_amount, status)
      VALUES ($1, $2, 'SHOP', $3, $4, $5, 'PAID') RETURNING id;
    `, [invoiceNo, customerId || null, order.id, subtotal, totalAmount]);
    await client.query(`
      INSERT INTO payments (payment_no, invoice_id, source_type, source_id, amount, payment_method, status, collected_by_id)
      VALUES ($1, $2, 'SHOP', $3, $4, $5, 'SUCCESS', $6);
    `, [`PAY-GEAR-${order.id}-${Date.now()}`, invoice.rows[0].id, order.id, totalAmount, paymentMethod, cashierId]);

    await client.query('COMMIT');
    return { ...order, items: orderItems.map(({ product, quantity, unitPrice, lineTotal }) => ({ product_id: product.id, name: product.name, quantity, unit_price: unitPrice, subtotal: lineTotal })) };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const listShopOrders = async () => {
  const result = await pool.query(`
    SELECT o.id, o.receipt_no, o.total_amount, o.payment_method, o.created_at,
           cashier.full_name AS cashier_name, customer.full_name AS customer_name
    FROM shop_orders o
    JOIN users cashier ON cashier.id = o.cashier_id
    LEFT JOIN users customer ON customer.id = o.customer_id
    ORDER BY o.created_at DESC LIMIT 100;
  `);
  return result.rows;
};
