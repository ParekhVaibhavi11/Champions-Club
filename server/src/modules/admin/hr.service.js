import bcrypt from 'bcryptjs';
import * as repo from './hr.repository.js';
import { sendStaffInvitationCredentials } from '../../utils/emailService.js';

export const getOverview = async () => {
  const [employees, shifts, leaveRequests] = await Promise.all([repo.getEmployees(), repo.getShifts(), repo.getLeaveRequests()]);
  return { employees, shifts, leave_requests: leaveRequests };
};

export const reviewLeave = async (id, status, adminId) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) throw Object.assign(new Error('status must be APPROVED or REJECTED.'), { statusCode: 400 });
  const updated = await repo.updateLeaveStatus(Number(id), status, adminId);
  if (!updated) throw Object.assign(new Error('Pending leave request not found.'), { statusCode: 404 });
  return updated;
};

export const createStaff = async ({ fullName, email, phone, department, jobTitle, monthlySalary, password, sendEmail = true }) => {
  if (!fullName || !email || !department || !password) {
    const error = new Error('Full name, email, department, and initial password are required.');
    error.statusCode = 400;
    throw error;
  }

  // Validate allowed department
  const validDepartments = ['shop', 'cafe', 'kitchen', 'front_desk'];
  if (!validDepartments.includes(department)) {
    const error = new Error(`Invalid department. Must be one of: ${validDepartments.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Map department to system user_role
  const role = department === 'front_desk' ? 'front_desk' : 'staff';
  const passwordHash = await bcrypt.hash(password, 10);

  const newStaff = await repo.createStaffEmployee({
    fullName,
    email,
    phone,
    role,
    department,
    jobTitle,
    monthlySalary: Number(monthlySalary) || 0,
    passwordHash,
  });

  // Attempt email delivery if requested
  let emailDelivery = { sent: false };
  if (sendEmail) {
    try {
      emailDelivery = await sendStaffInvitationCredentials({
        toEmail: email,
        fullName,
        password,
        department,
        jobTitle: jobTitle || 'Staff Member',
        role,
      });
    } catch (mailErr) {
      console.error('Failed to send staff invitation email:', mailErr);
    }
  }

  return {
    ...newStaff,
    initial_password: password, // Returned so Admin can view and copy credentials immediately
    email_delivery: emailDelivery,
  };
};
