import { trialsService } from './trials.service.js';

export const trialsController = {
  requestTrial: async (req, res, next) => {
    try {
      const {
        full_name,
        email,
        phone,
        sport_interest,
        preferred_date,
        preferred_time,
        participants_count,
        notes,
        payment_method,
      } = req.body;

      const lead = await trialsService.requestTrial({
        fullName: full_name,
        email,
        phone,
        sportInterest: sport_interest,
        preferredDate: preferred_date,
        preferredTime: preferred_time,
        participantsCount: participants_count,
        notes,
        paymentMethod: payment_method || 'UPI',
      });

      res.status(201).json({
        success: true,
        message: 'Guest session booked and tax invoice generated successfully!',
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  },

  getTrialStatus: async (req, res, next) => {
    try {
      const { referenceCode } = req.params;
      const { phone } = req.query;
      const trial = await trialsService.getTrialStatus(referenceCode, phone);
      res.status(200).json({ success: true, data: trial });
    } catch (err) {
      next(err);
    }
  },

  getInvoice: async (req, res, next) => {
    try {
      const { referenceCode } = req.params;
      const invoice = await trialsService.getInvoiceDetails(referenceCode);
      res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  },

  getAllLeads: async (req, res, next) => {
    try {
      const { status, sport, search } = req.query;
      const leads = await trialsService.getAllLeads({ status, sport, search });
      res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (err) {
      next(err);
    }
  },

  confirmTrial: async (req, res, next) => {
    try {
      const staffId = req.user?.id;
      const { lead_id, court_id, booking_date, start_time, notes } = req.body;

      const confirmed = await trialsService.confirmTrial({
        leadId: lead_id,
        courtId: court_id,
        bookingDate: booking_date,
        startTime: start_time,
        staffId,
        notes,
      });

      res.status(200).json({
        success: true,
        message: 'Guest session confirmed and court slot allocated successfully!',
        data: confirmed,
      });
    } catch (err) {
      next(err);
    }
  },

  updateLeadStatus: async (req, res, next) => {
    try {
      const staffId = req.user?.id;
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await trialsService.updateStatus(id, status, staffId, notes);
      res.status(200).json({
        success: true,
        message: `Lead status updated to ${status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  convertLead: async (req, res, next) => {
    try {
      const staffId = req.user?.id;
      const { id } = req.params;
      const { plan_id, password } = req.body;

      const result = await trialsService.convertLeadToMember({
        leadId: id,
        planId: plan_id,
        password,
        staffId,
      });

      res.status(201).json({
        success: true,
        message: 'Guest prospect converted into an active Club Member!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
