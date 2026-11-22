import * as membershipService from './memberships.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const getPlans = async (req, res, next) => {
  try {
    const plans = await membershipService.getPlans();
    return successResponse(res, plans, 'Membership plans fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getMembers = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const members = await membershipService.listMembers(search);
    return successResponse(res, members, 'Members directory retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const memberId = req.params.id;
    const member = await membershipService.getMemberProfile(memberId);
    return successResponse(res, member, 'Member profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createMember = async (req, res, next) => {
  try {
    const created = await membershipService.registerNewMember(req.body);
    return successResponse(res, created, 'New member registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const renewMembership = async (req, res, next) => {
  try {
    const membershipId = req.params.id;
    const months = req.body.months || 1;
    const result = await membershipService.renewMembership(membershipId, months);
    return successResponse(res, result, `Membership renewed successfully by ${months} month(s)`);
  } catch (err) {
    next(err);
  }
};

export const changeMemberPlan = async (req, res, next) => {
  try {
    const result = await membershipService.changeMemberPlan(req.params.id, req.body);
    return successResponse(res, result, 'Member plan activated successfully');
  } catch (err) {
    next(err);
  }
};

export const purchaseMembership = async (req, res, next) => {
  try {
    const result = await membershipService.purchaseMembership({
      userId: req.user.id,
      planId: req.body.planId,
      durationMonths: req.body.durationMonths,
      paymentMethod: req.body.paymentMethod,
    });
    return successResponse(res, result, 'Membership purchased and receipt generated', 201);
  } catch (err) {
    next(err);
  }
};
