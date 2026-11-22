import pool from '../../config/db.js';

export const getMenu = async () => {
  const result = await pool.query(`
    SELECT ci.id, ci.name, ci.description, ci.price, ci.member_discount_eligible,
           ci.is_available, cc.id AS category_id, cc.name AS category_name
    FROM menu_items ci LEFT JOIN cafe_categories cc ON cc.id = ci.category_id
    WHERE ci.is_available = TRUE ORDER BY cc.sort_order, ci.name;
  `);
  return result.rows;
};

export const findActiveMembershipByEmail = async (email) => {
  const result = await pool.query(`
    SELECT u.id AS user_id, u.full_name, u.email, m.id AS membership_id,
           p.name AS plan_name, p.tier AS plan_tier, p.cafe_discount_pct
    FROM users u
    JOIN memberships m ON m.user_id = u.id
    JOIN membership_plans p ON p.id = m.plan_id
    WHERE LOWER(u.email) = LOWER($1)
      AND u.role = 'member'
      AND m.status = 'ACTIVE'
      AND m.end_date >= CURRENT_DATE
    ORDER BY m.end_date DESC
    LIMIT 1;
  `, [email]);
  return result.rows[0] || null;
};

export const getTables = async () => {
  const result = await pool.query(`
    SELECT t.id, t.table_number, t.capacity, t.status,
           o.id AS order_id, o.order_no, o.total_amount, o.kitchen_status, o.created_at AS opened_at,
           o.member_id, o.guest_name, o.guest_email, u.full_name AS member_name
    FROM dining_tables t
    LEFT JOIN cafe_orders o ON o.table_id = t.id AND o.status = 'OPEN'
    LEFT JOIN users u ON u.id = o.member_id
    ORDER BY t.table_number;
  `);
  return result.rows;
};

export const createTab = async ({ tableId, memberId, guestName, guestEmail, staffId, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const table = await client.query(`SELECT id, status FROM dining_tables WHERE id = $1 FOR UPDATE`, [tableId]);
    if (!table.rows[0]) throw Object.assign(new Error('Dining table not found.'), { statusCode: 404 });
    const existing = await client.query(`SELECT id FROM cafe_orders WHERE table_id = $1 AND status = 'OPEN' LIMIT 1`, [tableId]);
    if (existing.rows[0]) throw Object.assign(new Error('This table already has an open tab.'), { statusCode: 409 });

    let discountPct = 0;
    let membershipTier = null;
    if (memberId) {
      const membership = await client.query(`
        SELECT cafe_discount_pct, tier FROM memberships m JOIN membership_plans p ON p.id = m.plan_id
        WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND m.end_date >= CURRENT_DATE
        ORDER BY m.end_date DESC LIMIT 1;
      `, [memberId]);
      discountPct = Number(membership.rows[0]?.cafe_discount_pct || 0);
      membershipTier = membership.rows[0]?.tier || null;
    }

    const prepared = [];
    let subtotal = 0;
    let eligibleSubtotal = 0;
    for (const item of items) {
      const menuResult = await client.query(`SELECT id, name, price, member_discount_eligible FROM menu_items WHERE id = $1 AND is_available = TRUE`, [item.menu_item_id]);
      const menu = menuResult.rows[0];
      if (!menu) throw Object.assign(new Error(`Menu item ${item.menu_item_id} is unavailable.`), { statusCode: 400 });
      const lineTotal = Number(menu.price) * item.quantity;
      subtotal += lineTotal;
      if (menu.member_discount_eligible) eligibleSubtotal += lineTotal;
      prepared.push({ menu, quantity: item.quantity, lineTotal, instructions: item.special_instructions || null });
    }
    const discountAmount = eligibleSubtotal * discountPct / 100;
    const totalAmount = subtotal - discountAmount;
    const orderNo = `CAF-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const orderResult = await client.query(`
      INSERT INTO cafe_orders (order_no, table_id, member_id, guest_name, guest_email, order_type, status, kitchen_status, subtotal, discount_amount, membership_discount_pct, membership_tier, total_amount, opened_by_staff_id)
      VALUES ($1, $2, $3, $4, $5, 'TAB', 'OPEN', 'PENDING', $6, $7, $8, $9, $10, $11)
      RETURNING id, order_no, table_id, member_id, guest_name, guest_email, status, kitchen_status, subtotal, discount_amount, membership_discount_pct, membership_tier, total_amount, created_at;
    `, [orderNo, tableId, memberId || null, guestName, guestEmail, subtotal, discountAmount, discountPct, membershipTier, totalAmount, staffId]);
    const order = orderResult.rows[0];
    for (const item of prepared) {
      await client.query(`
        INSERT INTO cafe_order_items (order_id, menu_item_id, quantity, unit_price, subtotal, special_instructions)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [order.id, item.menu.id, item.quantity, item.menu.price, item.lineTotal, item.instructions]);
    }
    await client.query(`UPDATE dining_tables SET status = 'OCCUPIED' WHERE id = $1`, [tableId]);
    await client.query('COMMIT');
    return { ...order, items: prepared.map((item) => ({ menu_item_id: item.menu.id, name: item.menu.name, quantity: item.quantity, unit_price: item.menu.price, subtotal: item.lineTotal, special_instructions: item.instructions })) };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const appendItems = async ({ orderId, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(`SELECT * FROM cafe_orders WHERE id = $1 AND status = 'OPEN' FOR UPDATE`, [orderId]);
    const order = orderResult.rows[0];
    if (!order) throw Object.assign(new Error('Open cafe tab not found.'), { statusCode: 404 });
    let eligibleSubtotal = 0;
    let additionSubtotal = 0;
    const prepared = [];
    let discountPct = 0;
    let membershipTier = null;
    if (order.member_id) {
      const membership = await client.query(`
        SELECT cafe_discount_pct, tier FROM memberships m JOIN membership_plans p ON p.id = m.plan_id
        WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND m.end_date >= CURRENT_DATE
        ORDER BY m.end_date DESC LIMIT 1;
      `, [order.member_id]);
      discountPct = Number(membership.rows[0]?.cafe_discount_pct || 0);
      membershipTier = membership.rows[0]?.tier || null;
    }
    for (const item of items) {
      const menuResult = await client.query(`SELECT id, name, price, member_discount_eligible FROM menu_items WHERE id = $1 AND is_available = TRUE`, [item.menu_item_id]);
      const menu = menuResult.rows[0];
      if (!menu) throw Object.assign(new Error(`Menu item ${item.menu_item_id} is unavailable.`), { statusCode: 400 });
      const lineTotal = Number(menu.price) * item.quantity;
      additionSubtotal += lineTotal;
      if (menu.member_discount_eligible) eligibleSubtotal += lineTotal;
      prepared.push({ menu, quantity: item.quantity, lineTotal, instructions: item.special_instructions || null });
      await client.query(`INSERT INTO cafe_order_items (order_id, menu_item_id, quantity, unit_price, subtotal, special_instructions) VALUES ($1, $2, $3, $4, $5, $6)`, [orderId, menu.id, item.quantity, menu.price, lineTotal, item.special_instructions || null]);
    }
    const discountAmount = Number(order.discount_amount) + eligibleSubtotal * discountPct / 100;
    const subtotal = Number(order.subtotal) + additionSubtotal;
    const updated = await client.query(`UPDATE cafe_orders SET subtotal = $2, discount_amount = $3, membership_discount_pct = $4, membership_tier = $5, total_amount = $6, kitchen_status = 'PENDING' WHERE id = $1 RETURNING id, order_no, subtotal, discount_amount, membership_discount_pct, membership_tier, total_amount, kitchen_status`, [orderId, subtotal, discountAmount, discountPct, membershipTier, subtotal - discountAmount]);
    await client.query('COMMIT');
    return { ...updated.rows[0], added_items: prepared.map(({ menu, quantity, lineTotal }) => ({ menu_item_id: menu.id, name: menu.name, quantity, subtotal: lineTotal })) };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const listOpenOrders = async () => {
  const result = await pool.query(`
    SELECT o.id, o.order_no, o.table_id, t.table_number, o.member_id, o.guest_name, o.guest_email,
           o.status, o.kitchen_status, o.subtotal, o.discount_amount, o.membership_discount_pct, o.membership_tier, o.total_amount,
           o.created_at, u.full_name AS member_name,
           COALESCE(json_agg(json_build_object('name', mi.name, 'quantity', oi.quantity, 'instructions', oi.special_instructions)) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
    FROM cafe_orders o
    LEFT JOIN dining_tables t ON t.id = o.table_id
    LEFT JOIN users u ON u.id = o.member_id
    LEFT JOIN cafe_order_items oi ON oi.order_id = o.id
    LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
    WHERE o.status = 'OPEN'
    GROUP BY o.id, t.table_number, u.full_name
    ORDER BY o.created_at ASC;
  `);
  return result.rows;
};

export const setKitchenStatus = async (orderId, status) => {
  const result = await pool.query(`
    UPDATE cafe_orders SET kitchen_status = $2
    WHERE id = $1 AND status = 'OPEN'
    RETURNING id, order_no, kitchen_status;
  `, [orderId, status]);
  return result.rows[0];
};

export const settleTab = async ({ orderId, staffId, paymentMethod }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(`SELECT * FROM cafe_orders WHERE id = $1 AND status = 'OPEN' FOR UPDATE`, [orderId]);
    const order = orderResult.rows[0];
    if (!order) throw Object.assign(new Error('Open cafe tab not found.'), { statusCode: 404 });
    if (!['READY', 'SERVED'].includes(order.kitchen_status)) {
      throw Object.assign(new Error('This café tab can only be paid after the kitchen marks it cooked.'), { statusCode: 409 });
    }
    await client.query(`UPDATE cafe_orders SET status = 'SETTLED', settled_at = NOW() WHERE id = $1`, [orderId]);
    if (order.table_id) await client.query(`UPDATE dining_tables SET status = 'AVAILABLE' WHERE id = $1`, [order.table_id]);
    const invoiceNo = `INV-CAFE-${order.id}-${Date.now()}`;
    const invoice = await client.query(`
      INSERT INTO invoices (invoice_no, user_id, source_type, source_id, subtotal, total_amount, status)
      VALUES ($1, $2, 'CAFE', $3, $4, $5, 'PAID') RETURNING id;
    `, [invoiceNo, order.member_id, order.id, order.subtotal - order.discount_amount, order.total_amount]);
    await client.query(`
      INSERT INTO payments (payment_no, invoice_id, source_type, source_id, amount, payment_method, status, collected_by_id)
      VALUES ($1, $2, 'CAFE', $3, $4, $5, 'SUCCESS', $6);
    `, [`PAY-CAFE-${order.id}-${Date.now()}`, invoice.rows[0].id, order.id, order.total_amount, paymentMethod, staffId]);
    const receiptItems = await client.query(`
      SELECT oi.menu_item_id, mi.name, oi.quantity, oi.unit_price, oi.subtotal
      FROM cafe_order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.order_id = $1
      ORDER BY oi.id;
    `, [orderId]);
    const tableResult = order.table_id
      ? await client.query('SELECT table_number FROM dining_tables WHERE id = $1', [order.table_id])
      : { rows: [] };
    await client.query('COMMIT');
    return {
      ...order,
      customer_name: order.guest_name,
      customer_email: order.guest_email,
      table_number: tableResult.rows[0]?.table_number || null,
      items: receiptItems.rows,
      payment_method: paymentMethod,
      status: 'SETTLED',
      receipt_email_status: 'PENDING',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateReceiptEmailStatus = async (orderId, status) => {
  const result = await pool.query(
    `UPDATE cafe_orders
     SET receipt_email_status = $2,
         receipt_emailed_at = CASE WHEN $2 = 'SENT' THEN NOW() ELSE receipt_emailed_at END
     WHERE id = $1
     RETURNING receipt_email_status, receipt_emailed_at`,
    [orderId, status]
  );
  return result.rows[0];
};
