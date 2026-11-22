import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Mail,
  Shield,
  Key,
  Calendar,
  Clock,
  Briefcase,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const AdminHr = () => {
  const [overview, setOverview] = useState({ employees: [], shifts: [], leave_requests: [] });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  // Modal State for adding new staff
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdStaffCreds, setCreatedStaffCreds] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'shop',
    jobTitle: '',
    monthlySalary: '',
    password: '',
    sendEmail: true,
  });

  const load = async () => {
    const response = await adminService.getHrOverview();
    setOverview(response.data || { employees: [], shifts: [], leave_requests: [] });
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const review = async (id, status) => {
    try {
      await adminService.reviewLeave(id, status);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  const handleOpenAddModal = () => {
    setCreatedStaffCreds(null);
    setCopied(false);
    generateRandomPassword();
    setIsAddModalOpen(true);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await adminService.createStaff(formData);
      const staff = res.data || res;
      setCreatedStaffCreds({
        fullName: staff.full_name,
        email: staff.email,
        password: staff.initial_password,
        department: staff.department,
        jobTitle: staff.job_title,
        role: staff.role,
      });
      setSuccessMsg(`Staff member ${staff.full_name} created successfully!`);
      await load();
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        department: 'shop',
        jobTitle: '',
        monthlySalary: '',
        password: '',
        sendEmail: true,
      });
    } catch (err) {
      setError(err.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdStaffCreds) return;
    const text = `🏆 CHAMPIONS CLUB STAFF PORTAL CREDENTIALS
Employee: ${createdStaffCreds.fullName}
Department: ${createdStaffCreds.department.toUpperCase()} (${createdStaffCreds.jobTitle})
Login URL: ${window.location.origin}/login
Email: ${createdStaffCreds.email}
Temporary Password: ${createdStaffCreds.password}

Please log in and update your password immediately.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const activeShifts = overview.shifts.filter((shift) => !shift.clock_out);
  const pendingLeave = overview.leave_requests.filter((request) => request.status === 'PENDING');

  const filteredEmployees = overview.employees.filter((emp) => {
    if (filterDepartment === 'ALL') return true;
    return emp.department === filterDepartment;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border bg-white p-6 md:p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase text-champion-dark tracking-tight">
            Staff & HR Management
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Manage your Pro Shop staff, Café & Bar servers, Kitchen line cooks, and Front Desk managers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 bg-champion-dark hover:bg-black text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-champion-red" />
          <span>Add New Staff Member</span>
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total Staff Roster', overview.employees.length, 'Active Team'],
          ['Currently On Shift', activeShifts.length, 'Clocked In'],
          ['Pending Leave Requests', pendingLeave.length, 'Requires Review'],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-1 text-3xl font-black text-champion-dark">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Staff Roster by Department */}
      <section className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black uppercase text-champion-dark">Employee Directory</h2>
            <p className="text-xs text-gray-500 mt-0.5">Filter by functional club department</p>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              ['ALL', 'All Staff'],
              ['shop', 'Shop Counter'],
              ['cafe', 'Café & Bar'],
              ['kitchen', 'Kitchen'],
              ['front_desk', 'Front Desk'],
            ].map(([deptKey, label]) => (
              <button
                key={deptKey}
                type="button"
                onClick={() => setFilterDepartment(deptKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterDepartment === deptKey
                    ? 'bg-champion-dark text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Monthly Salary</th>
                <th className="p-4">Hire Date</th>
                <th className="p-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 font-semibold">
                    No employees found in this department.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <strong className="text-sm font-bold text-gray-900 block">{emp.full_name}</strong>
                      <span className="text-[11px] text-gray-500 font-mono">{emp.email}</span>
                      {emp.phone && <span className="text-[11px] text-gray-400 block">{emp.phone}</span>}
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-gray-100 text-gray-800 uppercase text-[10px] font-black px-2.5 py-1 rounded-full border">
                        {emp.department}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{emp.job_title}</td>
                    <td className="p-4 font-mono font-bold text-gray-900">
                      ₹{Number(emp.monthly_salary || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(emp.hire_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          emp.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Shifts & Leave Approvals Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Shifts */}
        <section className="overflow-x-auto rounded-3xl border bg-white shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="text-base font-black uppercase text-champion-dark">Live Shifts & Attendance</h2>
              <p className="text-xs text-gray-400">Current shift records and clock-out status</p>
            </div>
            <span className="text-xs font-bold text-champion-blue font-mono">
              {activeShifts.length} Active Now
            </span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold">
              <tr>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Clock In</th>
                <th className="p-3">Clock Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overview.shifts.slice(0, 10).map((shift) => (
                <tr key={shift.id}>
                  <td className="p-3">
                    <span className="font-bold text-gray-900 block">{shift.full_name}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{shift.department}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-gray-600">
                    {new Date(shift.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 text-[11px]">
                    {shift.clock_out ? (
                      <span className="font-mono text-gray-500">
                        {new Date(shift.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] uppercase">
                        On Duty
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Leave Requests */}
        <section className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="border-b pb-3">
            <h2 className="text-base font-black uppercase text-champion-dark">Staff Leave Applications</h2>
            <p className="text-xs text-gray-400">Review pending time-off requests</p>
          </div>
          {overview.leave_requests.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No leave requests recorded.</p>
          ) : (
            <div className="space-y-3">
              {overview.leave_requests.map((request) => (
                <article key={request.id} className="rounded-2xl border p-4 bg-gray-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-sm font-bold text-gray-900">{request.full_name}</strong>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">{request.department}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        request.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : request.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {request.leave_type} · {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}
                  </p>
                  {request.reason && <p className="text-xs text-gray-500 italic">"{request.reason}"</p>}
                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => review(request.id, 'APPROVED')}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => review(request.id, 'REJECTED')}
                        className="rounded-xl border border-red-300 text-red-700 hover:bg-red-50 px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal: Add New Staff Member & Share Credentials */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5"
            >
              <X className="w-4 h-4" />
            </button>

            {createdStaffCreds ? (
              /* Success / Share Credentials Screen */
              <div className="space-y-6 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase text-gray-900">Staff Account Created</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Copy and share these login credentials with the team member.
                  </p>
                </div>

                {/* Credential Card */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase block">Employee Name</span>
                    <span className="text-gray-900 font-bold font-sans">{createdStaffCreds.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase block">Department & Role</span>
                    <span className="text-gray-900 uppercase font-bold">{createdStaffCreds.department} · {createdStaffCreds.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase block">Username / Email</span>
                    <span className="text-blue-700 font-bold">{createdStaffCreds.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase block">Temporary Password</span>
                    <span className="bg-yellow-100 text-yellow-900 px-2 py-1 rounded font-bold">{createdStaffCreds.password}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase block">Terminal Login URL</span>
                    <span className="text-gray-600">{window.location.origin}/login</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="flex-1 bg-champion-dark hover:bg-black text-white font-bold text-xs py-3 px-4 rounded-xl shadow flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs py-3 px-5 rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Add Staff Form */
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black uppercase text-champion-dark">Provision Staff Member</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Create secure staff credentials with role-based access.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@championsclub.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark bg-white font-medium"
                    >
                      <option value="shop">Pro Shop (Counter POS)</option>
                      <option value="cafe">Café & Bar (Server POS)</option>
                      <option value="kitchen">Kitchen (KDS Display)</option>
                      <option value="front_desk">Front Desk (Guest & Leads)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Designation / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Barista / Sales Exec"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={formData.monthlySalary}
                      onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-gray-600">Temporary Password *</label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Regenerate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none font-mono font-bold bg-gray-50 focus:ring-2 focus:ring-champion-dark"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-champion-dark focus:ring-champion-dark"
                  />
                  <label htmlFor="sendEmail" className="text-xs text-gray-600 cursor-pointer">
                    Send invitation email with login credentials automatically
                  </label>
                </div>

                <div className="flex gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-champion-dark hover:bg-black text-white font-bold text-xs py-2.5 rounded-xl shadow disabled:opacity-50"
                  >
                    {submitting ? 'Creating Staff Account...' : 'Create & Generate Credentials'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
