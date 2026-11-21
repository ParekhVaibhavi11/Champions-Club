import * as courtsService from './courts.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const getSports = async (req, res, next) => {
  try {
    const sports = await courtsService.listSports();
    return successResponse(res, sports, 'Sports facilities retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getCourts = async (req, res, next) => {
  try {
    const sportId = req.query.sport_id ? parseInt(req.query.sport_id, 10) : null;
    const courts = await courtsService.listCourts(sportId);
    return successResponse(res, courts, 'Courts list retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getManageCourts = async (req, res, next) => {
  try { return successResponse(res, await courtsService.listCourtsForManagement(), 'Courts retrieved for management'); } catch (err) { next(err); }
};

export const getCourtById = async (req, res, next) => {
  try {
    const courtId = parseInt(req.params.id, 10);
    const court = await courtsService.getCourtDetails(courtId);
    return successResponse(res, court, 'Court details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const courtId = req.query.court_id ? parseInt(req.query.court_id, 10) : null;
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const availability = await courtsService.calculateAvailability(courtId, dateStr);
    return successResponse(res, availability, 'Court availability matrix calculated successfully');
  } catch (err) {
    next(err);
  }
};

export const createCourt = async (req, res, next) => {
  try { return successResponse(res, await courtsService.createCourt(req.body), 'Court created', 201); } catch (err) { next(err); }
};

export const updateCourt = async (req, res, next) => {
  try { return successResponse(res, await courtsService.updateCourt(req.params.id, req.body), 'Court updated'); } catch (err) { next(err); }
};

export const createMaintenanceBlock = async (req, res, next) => {
  try { return successResponse(res, await courtsService.createMaintenanceBlock(req.params.id, req.body), 'Maintenance block created', 201); } catch (err) { next(err); }
};
