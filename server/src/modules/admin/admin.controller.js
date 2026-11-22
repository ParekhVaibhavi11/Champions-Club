import * as service from './admin.service.js';
import * as hrService from './hr.service.js';

import { successResponse } from '../../utils/apiResponse.js';

export const summary = async (req, res, next) => {
    try {
        return successResponse(
            res,
            await service.getSummary(),
            'Admin dashboard summary retrieved'
        );
    } catch (err) {
        next(err);
    }
};

export const membershipPlans = async (req, res, next) => {
    try {
        return successResponse(res, await service.getMembershipPlans(), 'Membership plans retrieved');
    } catch (err) { next(err); }
};

export const createMembershipPlan = async (req, res, next) => {
    try {
        return successResponse(res, await service.createMembershipPlan(req.body), 'Membership plan created', 201);
    } catch (err) { next(err); }
};

export const updateMembershipPlan = async (req, res, next) => {
    try {
        return successResponse(res, await service.updateMembershipPlan(req.params.id, req.body), 'Membership plan updated');
    } catch (err) { next(err); }
};

export const revenue = async (req, res, next) => {
    try {
        return successResponse(
            res,
            await service.getRevenue(req.query.from, req.query.to),
            'Department revenue retrieved'
        );
    } catch (err) {
        next(err);
    }
};

export const ledger = async (req, res, next) => {
    try {
        return successResponse(
            res,
            await service.getLedger(req.query.from, req.query.to),
            'Finance ledger retrieved'
        );
    } catch (err) {
        next(err);
    }
};

export const hrOverview = async (req, res, next) => {
    try {
        return successResponse(
            res,
            await hrService.getOverview(),
            'HR overview retrieved'
        );
    } catch (err) {
        next(err);
    }
};

export const reviewLeave = async (req, res, next) => {
    try {
        return successResponse(
            res,
            await hrService.reviewLeave(
                req.params.id,
                req.body.status,
                req.user.id
            ),
            'Leave request reviewed'
        );
    } catch (err) {
        next(err);
    }
};

export const createStaff = async (req, res, next) => {
    try {
        const staff = await hrService.createStaff(req.body);
        return successResponse(res, staff, 'Staff member created successfully', 201);
    } catch (err) {
        next(err);
    }
};
