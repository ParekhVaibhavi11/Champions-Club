import nodemailer from 'nodemailer';

export const sendStaffInvitationCredentials = async ({ toEmail, fullName, password, department, jobTitle, role }) => {
  const cleanPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  const user = process.env.SMTP_USER;
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;

  if (!user || !cleanPass) {
    console.log('\n======================================================');
    console.log('⚠️ [DEV MODE] Simulated Staff Welcome Email');
    console.log(`📧 Sent to: ${toEmail} (${fullName})`);
    console.log(`🏢 Department: ${department} | Role: ${role} | Title: ${jobTitle}`);
    console.log(`🔑 Temporary Password: ${password}`);
    console.log(`🔗 Login URL: ${loginUrl}`);
    console.log('======================================================\n');
    return { sent: true, mode: 'dev' };
  }

  const isGmail = process.env.SMTP_HOST?.includes('gmail') || user?.includes('gmail');
  const transportConfig = isGmail
    ? { service: 'gmail', auth: { user, pass: cleanPass } }
    : {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass: cleanPass },
      };

  const transporter = nodemailer.createTransport(transportConfig);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Champions Club Staffing" <${user}>`,
    to: toEmail,
    subject: `Your Champions Club Staff Portal Credentials (${department.toUpperCase()})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #C8102E; color: #ffffff; font-weight: 900; font-size: 22px; padding: 12px 16px; border-radius: 10px;">CC</div>
          <h2 style="color: #111111; margin-top: 16px; text-transform: uppercase;">Staff Account Provisioned</h2>
          <p style="color: #6b7280; font-size: 13px;">Welcome to the Champions Club Operations Team, ${fullName}!</p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 10px 0; font-size: 13px;"><strong>Department:</strong> ${department.toUpperCase()}</p>
          <p style="margin: 0 0 10px 0; font-size: 13px;"><strong>Job Title:</strong> ${jobTitle}</p>
          <p style="margin: 0 0 10px 0; font-size: 13px;"><strong>Portal Username (Email):</strong> <span style="font-family: monospace; color: #2563eb;">${toEmail}</span></p>
          <p style="margin: 0; font-size: 13px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-weight: bold; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" style="background: #111111; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Sign In to Staff Terminal</a>
        </div>
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">Please keep your credentials confidential and change your temporary password upon first login.</p>
      </div>
    `,
  });
  return { sent: true, mode: 'smtp' };
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
