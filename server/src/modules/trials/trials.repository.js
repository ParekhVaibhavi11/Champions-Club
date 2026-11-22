import pool from '../../config/db.js';
import crypto from 'crypto';

export const trialsRepository = {
  GUEST_RATES: {
    Tennis: 1200.00,
    Cricket: 1500.00,
    Padel: 1400.00,
    Badminton: 800.00,
  },

  // Atomic creation of lead, tax invoice, and payment record
  createTrialLead: async ({
    fullName,
    email,
    phone,
    sportInterest,
    preferredDate,
    preferredTime,
    participantsCount = 1,
    notes = null,
    paymentMethod = 'UPI',
  }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const year = new Date().getFullYear();
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      const referenceCode = `GST-${year}-${randomHex}`;
      const secretToken = crypto.randomBytes(16).toString('hex');

      // Rate calculation (Base fee + 18% GST: 9% CGST + 9% SGST)
      const baseFee = trialsRepository.GUEST_RATES[sportInterest] || 1200.00;
      const taxAmount = parseFloat((baseFee * 0.18).toFixed(2));
      const totalAmount = parseFloat((baseFee + taxAmount).toFixed(2));

      // Check visit history for returning guests
      const historyCheck = await client.query(
        `SELECT count(*) FROM leads WHERE phone = $1 OR email = $2`,
        [phone, email]
      );
      const visitCount = parseInt(historyCheck.rows[0].count, 10) + 1;

      // 1. Insert Lead
      const leadQuery = `
        INSERT INTO leads (
          full_name, email, phone, sport_interest, inquiry_type,
          status, preferred_date, preferred_time, participants_count,
          notes, reference_code, secret_token, fee_charged, visit_count,
          payment_method, payment_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'GUEST_DEMO_BOOKING', 'REQUESTED', $5, $6, $7, $8, $9, $10, $11, $12, $13, 'SUCCESS', NOW(), NOW())
        RETURNING *
      `;
      const leadRes = await client.query(leadQuery, [
        fullName,
        email,
        phone,
        sportInterest,
        preferredDate,
        preferredTime,
        participantsCount,
        notes,
        referenceCode,
        secretToken,
        totalAmount,
        visitCount,
        paymentMethod,
      ]);
      const createdLead = leadRes.rows[0];

      // 2. Generate Invoice Number: INV-YYYY-XXXX
      const invCountRes = await client.query('SELECT count(*) FROM invoices');
      const invSeq = String(parseInt(invCountRes.rows[0].count, 10) + 1).padStart(4, '0');
      const invoiceNo = `INV-${year}-${invSeq}`;

      const invInsert = await client.query(
        `INSERT INTO invoices (
          invoice_no, user_id, source_type, source_id, subtotal, tax_amount, total_amount, status, due_date, created_at
        ) VALUES ($1, NULL, 'GUEST_TRIAL', $2, $3, $4, $5, 'PAID', $6, NOW())
        RETURNING *`,
        [invoiceNo, createdLead.id, baseFee, taxAmount, totalAmount, preferredDate]
      );
      const createdInvoice = invInsert.rows[0];

      // 3. Insert Payment record
      const payNo = `PAY-${year}-${randomHex}`;
      const txnRef = `TXN-${paymentMethod}-${Date.now().toString().slice(-6)}`;
      await client.query(
        `INSERT INTO payments (
          payment_no, invoice_id, source_type, source_id, amount, payment_method, transaction_ref, status, created_at
        ) VALUES ($1, $2, 'GUEST_TRIAL', $3, $4, $5, $6, 'SUCCESS', NOW())`,
        [payNo, createdInvoice.id, createdLead.id, totalAmount, paymentMethod, txnRef]
      );

      // 4. Link invoice to lead
      await client.query('UPDATE leads SET invoice_id = $1 WHERE id = $2', [createdInvoice.id, createdLead.id]);

      await client.query('COMMIT');

      return {
        ...createdLead,
        invoice_id: createdInvoice.id,
        invoice_no: invoiceNo,
        base_fee: baseFee,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_ref: txnRef,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Get full trial & invoice details by reference code
  getTrialByReference: async (referenceCode, phoneEnding = null) => {
    let query = `
      SELECT 
        l.*,
        c.name AS court_name,
        s.name AS sport_name,
        i.invoice_no,
        i.subtotal AS invoice_subtotal,
        i.tax_amount AS invoice_tax,
        i.total_amount AS invoice_total,
        i.status AS invoice_status,
        p.payment_method AS tender_method,
        p.transaction_ref
      FROM leads l
      LEFT JOIN courts c ON l.court_id = c.id
      LEFT JOIN sports s ON c.sport_id = s.id
      LEFT JOIN invoices i ON l.invoice_id = i.id
      LEFT JOIN payments p ON p.invoice_id = i.id
      WHERE l.reference_code = $1
    `;
    const params = [referenceCode];

    if (phoneEnding) {
      params.push(`%${phoneEnding}`);
      query += ` AND l.phone LIKE $${params.length}`;
    }

    const res = await pool.query(query, params);
    return res.rows[0];
  },

  // Get full invoice by invoice_no or referenceCode
  getInvoiceDetails: async (referenceCode) => {
    const query = `
      SELECT 
        i.*,
        l.reference_code,
        l.full_name,
        l.email,
        l.phone,
        l.sport_interest,
        l.preferred_date,
        l.preferred_time,
        c.name AS court_name,
        p.payment_method AS tender_method,
        p.transaction_ref,
        p.payment_no
      FROM invoices i
      JOIN leads l ON i.id = l.invoice_id
      LEFT JOIN courts c ON l.court_id = c.id
      LEFT JOIN payments p ON p.invoice_id = i.id
      WHERE l.reference_code = $1
    `;
    const res = await pool.query(query, [referenceCode]);
    return res.rows[0];
  },

  // Get all leads for Front Desk CRM
  getAllLeads: async ({ status = null, sport = null, search = null } = {}) => {
    let query = `
      SELECT 
        l.*,
        c.name AS court_name,
        u.full_name AS assigned_staff_name,
        i.invoice_no,
        i.total_amount AS invoice_total
      FROM leads l
      LEFT JOIN courts c ON l.court_id = c.id
      LEFT JOIN users u ON l.assigned_staff_id = u.id
      LEFT JOIN invoices i ON l.invoice_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND l.status = $${params.length}`;
    }

    if (sport && sport !== 'ALL') {
      params.push(sport);
      query += ` AND l.sport_interest ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (l.full_name ILIKE $${params.length} OR l.email ILIKE $${params.length} OR l.phone ILIKE $${params.length} OR l.reference_code ILIKE $${params.length} OR i.invoice_no ILIKE $${params.length})`;
    }

    query += ` ORDER BY l.created_at DESC`;

    const res = await pool.query(query, params);
    return res.rows;
  },

  // Confirm Trial & Atomically Allocate Court with paid booking
  confirmTrialAllocation: async ({ leadId, courtId, bookingDate, startTime, staffId, notes = '' }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const leadRes = await client.query('SELECT * FROM leads WHERE id = $1 FOR UPDATE', [leadId]);
      if (leadRes.rows.length === 0) {
        throw { status: 404, message: 'Guest booking lead not found' };
      }
      const lead = leadRes.rows[0];

      const startHour = parseInt(startTime.split(':')[0], 10);
      const startMin = startTime.split(':')[1] || '00';
      const endHour = startHour + 1;
      const endTime = `${String(endHour).padStart(2, '0')}:${startMin}:00`;
      const startTimestamp = `${bookingDate} ${startTime}`;
      const endTimestamp = `${bookingDate} ${endTime}`;

      let allocationId;
      try {
        const allocRes = await client.query(
          `INSERT INTO court_allocations (court_id, slot_range, type, status)
           VALUES ($1, tstzrange($2::timestamptz, $3::timestamptz, '[)'), 'GUEST_BOOKING', 'CONFIRMED')
           RETURNING id`,
          [courtId, startTimestamp, endTimestamp]
        );
        allocationId = allocRes.rows[0].id;
      } catch (err) {
        if (err.code === '23P01') {
          throw { status: 409, message: 'This court is already booked or allocated for this time slot.' };
        }
        throw err;
      }

      const fee = parseFloat(lead.fee_charged || 1200.00);
      const bookingInsert = await client.query(
        `INSERT INTO bookings (
          allocation_id, member_id, booked_by_staff_id, guest_name, guest_phone, fee_charged, payment_status, notes
        ) VALUES ($1, NULL, $2, $3, $4, $5, 'SUCCESS', $6)
        RETURNING id`,
        [allocationId, staffId, lead.full_name, lead.phone, fee, `Guest Demo Session: ${lead.full_name} (${lead.reference_code})`]
      );
      const bookingId = bookingInsert.rows[0].id;

      const updatedLead = await client.query(
        `UPDATE leads SET 
          status = 'CONFIRMED',
          court_id = $1,
          booking_id = $2,
          assigned_staff_id = $3,
          preferred_date = $4,
          preferred_time = $5,
          notes = COALESCE($6, notes),
          updated_at = NOW()
        WHERE id = $7
        RETURNING *`,
        [courtId, bookingId, staffId, bookingDate, startTime, notes || lead.notes, leadId]
      );

      await client.query('COMMIT');
      return updatedLead.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  updateLeadStatus: async (leadId, status, staffId = null, notes = null) => {
    let query = `
      UPDATE leads 
      SET status = $1, updated_at = NOW()
    `;
    const params = [status];

    if (staffId) {
      params.push(staffId);
      query += `, assigned_staff_id = $${params.length}`;
    }

    if (notes) {
      params.push(notes);
      query += `, notes = $${params.length}`;
    }

    params.push(leadId);
    query += ` WHERE id = $${params.length} RETURNING *`;

    const res = await pool.query(query, params);
    return res.rows[0];
  },
};
