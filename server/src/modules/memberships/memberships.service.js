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

// Public signup creates a member account and profile without starting a paid plan.
export const registerAccount = async ({ fullName, email, phone, password }) => {
  if (!fullName || !email || !password) {
    const error = new Error('Full name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    return await membershipRepo.createMemberTransaction({
      fullName,
      email,
      phone,
      passwordHash,
    });
  } catch (err) {
    if (err.code === '23505') {
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

export const changeMemberPlan = async (userId, { planId, durationMonths = 12, action }) => {
  const normalizedPlanId = Number(planId);
  const normalizedDuration = Number(durationMonths);
  const normalizedAction = String(action || '').toUpperCase();

  if (!Number.isInteger(normalizedPlanId) || ![1, 6, 12].includes(normalizedDuration) || !['CHOOSE', 'UPGRADE'].includes(normalizedAction)) {
    const error = new Error('A valid plan, duration (1, 6, or 12 months), and action are required.');
    error.statusCode = 400;
    throw error;
  }

  const member = await membershipRepo.getMemberDetailsById(userId);
  if (!member) {
    const error = new Error('Member profile not found');
    error.statusCode = 404;
    throw error;
  }

  const plan = await membershipRepo.getPlanById(normalizedPlanId);
  if (!plan) {
    const error = new Error('Selected membership plan is invalid');
    error.statusCode = 400;
    throw error;
  }

  const hasActivePlan = Boolean(member.membership_id && member.membership_status === 'ACTIVE');
  if (normalizedAction === 'CHOOSE' && hasActivePlan) {
    const error = new Error('This member already has an active plan. Use the upgrade or extend action.');
    error.statusCode = 409;
    throw error;
  }
  if (normalizedAction === 'UPGRADE' && !hasActivePlan) {
    const error = new Error('This member has no active plan to upgrade. Choose a plan instead.');
    error.statusCode = 409;
    throw error;
  }
  if (normalizedAction === 'UPGRADE' && Number(plan.monthly_fee) <= Number(member.monthly_fee)) {
    const error = new Error('Upgrade must use a plan with a higher monthly fee.');
    error.statusCode = 400;
    throw error;
  }
  if (plan.tier === 'JUNIOR' && member.date_of_birth) {
    const birthYear = new Date(member.date_of_birth).getFullYear();
    if (new Date().getFullYear() - birthYear >= 18) {
      const error = new Error('Junior Tier is reserved exclusively for athletes under 18 years old');
      error.statusCode = 400;
      throw error;
    }
  }

  return membershipRepo.assignPlanToExistingMember({
    userId,
    planId: normalizedPlanId,
    durationMonths: normalizedDuration,
    action: normalizedAction,
  });
};
