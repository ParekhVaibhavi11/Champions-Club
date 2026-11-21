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
