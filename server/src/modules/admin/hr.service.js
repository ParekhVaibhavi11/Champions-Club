import * as repo from './hr.repository.js';
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
