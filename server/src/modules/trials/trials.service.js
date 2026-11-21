import { trialsRepository } from './trials.repository.js';
import * as membershipsService from '../memberships/memberships.service.js';

export const trialsService = {
  requestTrial: async ({
    fullName,
    email,
    phone,
    sportInterest,
    preferredDate,
    preferredTime,
    participantsCount,
    notes,
    paymentMethod = 'UPI',
  }) => {
    if (!fullName || !email || !phone || !sportInterest || !preferredDate || !preferredTime) {
      throw { status: 400, message: 'Please provide all required fields for guest booking.' };
    }

    const hour = parseInt(preferredTime.split(':')[0], 10);
    if (isNaN(hour) || hour < 6 || hour >= 22) {
      throw { status: 400, message: 'Sessions can only be booked between 06:00 and 22:00.' };
    }

    return await trialsRepository.createTrialLead({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      sportInterest: sportInterest.trim(),
      preferredDate,
      preferredTime,
      participantsCount: parseInt(participantsCount, 10) || 1,
      notes,
      paymentMethod,
    });
  },

  getTrialStatus: async (referenceCode, phoneEnding) => {
    if (!referenceCode) {
      throw { status: 400, message: 'Reference code is required' };
    }
    const trial = await trialsRepository.getTrialByReference(referenceCode.toUpperCase().trim(), phoneEnding);
    if (!trial) {
      throw { status: 404, message: 'No guest booking found matching reference code and phone number.' };
    }
    return trial;
  },

  getInvoiceDetails: async (referenceCode) => {
    if (!referenceCode) {
      throw { status: 400, message: 'Reference code is required' };
    }
    const invoice = await trialsRepository.getInvoiceDetails(referenceCode.toUpperCase().trim());
    if (!invoice) {
      throw { status: 404, message: 'Tax invoice not found for this booking reference.' };
    }
    return invoice;
  },

  getAllLeads: async (filters) => {
    return await trialsRepository.getAllLeads(filters);
  },

  confirmTrial: async ({ leadId, courtId, bookingDate, startTime, staffId, notes }) => {
    if (!leadId || !courtId || !bookingDate || !startTime) {
      throw { status: 400, message: 'Lead ID, Court ID, Date and Start Time are required.' };
    }
    return await trialsRepository.confirmTrialAllocation({
      leadId: parseInt(leadId, 10),
      courtId: parseInt(courtId, 10),
      bookingDate,
      startTime,
      staffId,
      notes,
    });
  },

  updateStatus: async (leadId, status, staffId, notes) => {
    const validStatuses = ['REQUESTED', 'CONTACTED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'CONVERTED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw { status: 400, message: 'Invalid lead status' };
    }
    return await trialsRepository.updateLeadStatus(parseInt(leadId, 10), status.toUpperCase(), staffId, notes);
  },

  convertLeadToMember: async ({ leadId, planId, password, staffId }) => {
    const leadsList = await trialsRepository.getAllLeads({});
    const targetLead = leadsList.find(l => l.id === parseInt(leadId, 10));
    if (!targetLead) {
      throw { status: 404, message: 'Lead not found for conversion' };
    }

    const registrationResult = await membershipsService.registerNewMember({
      fullName: targetLead.full_name,
      email: targetLead.email,
      phone: targetLead.phone,
      password: password || 'Welcome@123',
      planId: planId || 2,
    });

    const memberCode = registrationResult.memberCode || registrationResult.member?.member_code || 'CC-MEMBER';
    await trialsRepository.updateLeadStatus(targetLead.id, 'CONVERTED', staffId, `Converted to Member: ${memberCode}`);

    return {
      ...registrationResult,
      memberCode,
    };
  },
};
