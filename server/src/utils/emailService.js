import nodemailer from 'nodemailer';

const createEmailTransporter = (user, cleanPass) => {
  const isGmail = process.env.SMTP_HOST?.includes('gmail') || user?.includes('gmail');
  const transportConfig = isGmail
    ? { service: 'gmail', auth: { user, pass: cleanPass } }
    : {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass: cleanPass },
      };
  return nodemailer.createTransport(transportConfig);
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

export const sendGearShopReceipt = async (toEmail, customerName, receipt) => {
  const cleanPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  const user = process.env.SMTP_USER;
  const itemsHtml = (receipt.items || []).map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.name)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">${Number(item.quantity)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">₹${Number(item.subtotal).toFixed(2)}</td>
    </tr>
  `).join('');
  const discountDescription = Number(receipt.membership_discount_pct) > 0
    ? `Membership discount (${escapeHtml(receipt.membership_tier)} ${Number(receipt.membership_discount_pct)}%)`
    : 'Discount';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827">
      <h1 style="color:#c8102e;margin-bottom:4px">Champions Club</h1>
      <h2 style="margin-top:0">Gear Shop Receipt</h2>
      <p>Hello ${escapeHtml(customerName)}, thank you for your purchase.</p>
      <p><strong>Receipt:</strong> ${escapeHtml(receipt.receipt_no)}<br>
         <strong>Date:</strong> ${new Date(receipt.created_at).toLocaleString('en-IN')}<br>
         <strong>Payment:</strong> ${escapeHtml(receipt.payment_method)}</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead><tr><th style="text-align:left;padding:10px;border-bottom:2px solid #111827">Item</th><th style="padding:10px;border-bottom:2px solid #111827">Qty</th><th style="text-align:right;padding:10px;border-bottom:2px solid #111827">Amount</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right"><strong>Subtotal:</strong> ₹${Number(receipt.subtotal).toFixed(2)}<br>
        <strong>${discountDescription}:</strong> −₹${Number(receipt.discount_amount).toFixed(2)}<br>
        <strong>Total paid:</strong> ₹${Number(receipt.total_amount).toFixed(2)}</p>
      <p style="color:#6b7280;font-size:12px">Please keep this email as your purchase receipt.</p>
    </div>`;

  if (!user || !cleanPass) {
    console.log(`[DEV MODE] Gear Shop receipt ${receipt.receipt_no} for ${toEmail}: ${Number(receipt.total_amount).toFixed(2)}`);
    return { sent: true, mode: 'dev' };
  }

  const transporter = createEmailTransporter(user, cleanPass);
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Champions Club" <${user}>`,
    to: toEmail,
    subject: `Your Champions Club Gear Shop receipt ${receipt.receipt_no}`,
    html,
  });
  return { sent: true, mode: 'smtp', messageId: info.messageId };
};

export const sendCafeReceiptEmail = async (toEmail, customerName, receipt) => {
  const cleanPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  const user = process.env.SMTP_USER;
  const itemsHtml = (receipt.items || []).map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.name)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">${Number(item.quantity)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">₹${Number(item.subtotal).toFixed(2)}</td>
    </tr>
  `).join('');
  const discountDescription = Number(receipt.membership_discount_pct) > 0
    ? `Membership discount (${escapeHtml(receipt.membership_tier)} ${Number(receipt.membership_discount_pct)}%)`
    : 'Discount';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827">
      <h1 style="color:#c8102e;margin-bottom:4px">Champions Club</h1>
      <h2 style="margin-top:0">Café &amp; Bar Receipt</h2>
      <p>Hello ${escapeHtml(customerName)}, thank you for dining with us.</p>
      <p><strong>Order:</strong> ${escapeHtml(receipt.order_no)}<br>
         <strong>Table:</strong> ${escapeHtml(receipt.table_number || 'Takeaway')}<br>
         <strong>Date:</strong> ${new Date(receipt.settled_at || receipt.created_at).toLocaleString('en-IN')}<br>
         <strong>Payment:</strong> ${escapeHtml(receipt.payment_method)}</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead><tr><th style="text-align:left;padding:10px;border-bottom:2px solid #111827">Item</th><th style="padding:10px;border-bottom:2px solid #111827">Qty</th><th style="text-align:right;padding:10px;border-bottom:2px solid #111827">Amount</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right"><strong>Subtotal:</strong> ₹${Number(receipt.subtotal).toFixed(2)}<br>
        <strong>${discountDescription}:</strong> −₹${Number(receipt.discount_amount).toFixed(2)}<br>
        <strong>Total paid:</strong> ₹${Number(receipt.total_amount).toFixed(2)}</p>
      <p style="color:#6b7280;font-size:12px">Please keep this email as your café receipt.</p>
    </div>`;

  if (!user || !cleanPass) {
    console.log(`[DEV MODE] Cafe receipt ${receipt.order_no} for ${toEmail}: ${Number(receipt.total_amount).toFixed(2)}`);
    return { sent: true, mode: 'dev' };
  }

  const transporter = createEmailTransporter(user, cleanPass);
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Champions Club" <${user}>`,
    to: toEmail,
    subject: `Your Champions Club Café receipt ${receipt.order_no}`,
    html,
  });
  return { sent: true, mode: 'smtp', messageId: info.messageId };
};

export const sendMembershipReceiptEmail = async (toEmail, customerName, receipt) => {
  const cleanPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  const user = process.env.SMTP_USER;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827">
      <h1 style="color:#c8102e;margin-bottom:4px">Champions Club</h1>
      <h2 style="margin-top:0">Membership Payment Receipt</h2>
      <p>Hello ${escapeHtml(customerName)}, your membership purchase is confirmed.</p>
      <p><strong>Invoice:</strong> ${escapeHtml(receipt.invoice_no)}<br>
         <strong>Payment reference:</strong> ${escapeHtml(receipt.payment_no)}<br>
         <strong>Plan:</strong> ${escapeHtml(receipt.plan_name)} (${escapeHtml(receipt.plan_tier)})<br>
         <strong>Duration:</strong> ${Number(receipt.duration_months)} month(s)<br>
         <strong>Valid from:</strong> ${new Date(receipt.start_date).toLocaleDateString('en-IN')}<br>
         <strong>Valid until:</strong> ${new Date(receipt.end_date).toLocaleDateString('en-IN')}<br>
         <strong>Payment method:</strong> ${escapeHtml(receipt.payment_method)}</p>
      <p style="padding:16px;background:#f3f4f6;text-align:right;font-size:18px"><strong>Total paid: ₹${Number(receipt.total_amount).toFixed(2)}</strong></p>
      <p style="color:#6b7280;font-size:12px">Please keep this email as your membership payment receipt.</p>
    </div>`;

  if (!user || !cleanPass) {
    console.log(`[DEV MODE] Membership receipt ${receipt.invoice_no} for ${toEmail}: ${Number(receipt.total_amount).toFixed(2)}`);
    return { sent: true, mode: 'dev' };
  }

  const transporter = createEmailTransporter(user, cleanPass);
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Champions Club" <${user}>`,
    to: toEmail,
    subject: `Your Champions Club ${receipt.plan_tier} membership receipt ${receipt.invoice_no}`,
    html,
  });
  return { sent: true, mode: 'smtp', messageId: info.messageId };
};

export const sendPasswordResetOTP = async (toEmail, otpCode) => {
  const cleanPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  const user = process.env.SMTP_USER;

  if (!user || !cleanPass) {
    console.log('\n======================================================');
    console.log('⚠️ [DEV MODE] SMTP not configured in server/.env');
    console.log(`📧 Simulated OTP to: ${toEmail}`);
    console.log(`🔑 6-Digit Code: ${otpCode}`);
    console.log('======================================================\n');
    return { sent: true, mode: 'dev' };
  }

  // Create transporter: if host contains gmail or service is gmail
  const isGmail = process.env.SMTP_HOST?.includes('gmail') || user?.includes('gmail');
  
  const transportConfig = isGmail 
    ? {
        service: 'gmail',
        auth: {
          user: user,
          pass: cleanPass,
        },
      }
    : {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: user,
          pass: cleanPass,
        },
      };

  const transporter = nodemailer.createTransport(transportConfig);

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Champions Club" <${user}>`,
    to: toEmail,
    subject: `${otpCode} is your Champions Club verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #C8102E; color: #ffffff; font-weight: 900; font-size: 22px; padding: 12px 16px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">CC</div>
          <h2 style="color: #111111; margin-top: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Password Reset Code</h2>
        </div>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; text-align: center;">
          Use the following 6-digit verification code to reset the password for your <strong>Champions Club</strong> account:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; background: #F3F4F6; border: 2px dashed #C8102E; color: #111111; font-weight: 900; font-size: 32px; letter-spacing: 6px; padding: 14px 28px; border-radius: 12px; font-family: monospace;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
          This code is valid for <strong>15 minutes</strong>. Do not share this code with anyone.
        </p>
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">
          Champions Club • Elite Sports Complex • Security Notification
        </p>
      </div>
    `,
  });

  console.log(`✅ Reset OTP ${otpCode} successfully sent to ${toEmail}: ${info.messageId}`);
  return { sent: true, mode: 'smtp' };
};
