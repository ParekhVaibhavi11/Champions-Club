import bcrypt from 'bcryptjs';
import * as membershipRepo from './memberships.repository.js';

export const getPlans = async () => {
  return await membershipRepo.getAllPlans();
};

export const listMembers = async (search = '') => {
  return await membershipRepo.searchMembers(search);
};

export const getMemberProfile = async (userId) => {
  const member = await membershipRepo.getMemberDetailsById(userId);
  if (!member) {
    const error = new Error('Member profile not found');
    error.statusCode = 404;
    throw error;
  }
  return member;
};

export const registerNewMember = async ({ fullName, email, phone, password = 'Password123!', dateOfBirth, emergencyContact, emergencyPhone, address, planId, durationMonths = 12 }) => {
  if (!fullName || !email || !planId) {
    const error = new Error('Full name, email, and membership plan are required');
    error.statusCode = 400;
    throw error;
  }

  // Check if plan exists
  const plan = await membershipRepo.getPlanById(planId);
  if (!plan) {
    const error = new Error('Selected membership plan is invalid');
    error.statusCode = 400;
    throw error;
  }

  // Junior plan check (if age provided, should be under 18)
  if (plan.tier === 'JUNIOR' && dateOfBirth) {
    const birthYear = new Date(dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear >= 18) {
      const error = new Error('Junior Tier is reserved exclusively for athletes under 18 years old');
      error.statusCode = 400;
      throw error;
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await membershipRepo.createMemberTransaction({
      fullName,
      email,
      phone,
      passwordHash,
      dateOfBirth,
      emergencyContact,
      emergencyPhone,
      address,
      planId,
      durationMonths,
    });
  } catch (err) {
    if (err.code === '23505') { // unique violation in pg
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

export const renewMembership = async (membershipId, months = 1) => {
  if (!membershipId) {
    const error = new Error('Membership ID is required');
    error.statusCode = 400;
    throw error;
  }

  const updated = await membershipRepo.extendMembership(membershipId, months);
  if (!updated) {
    const error = new Error('Membership not found or renewal failed');
    error.statusCode = 404;
    throw error;
  }

  return updated;
};
