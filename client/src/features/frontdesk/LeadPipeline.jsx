import React, { useState, useEffect } from 'react';
import { trialService } from '../../services/trialService';
import { courtService } from '../../services/courtService';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  Clock,
  Phone,
  Mail,
  UserCheck,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  History,
  CreditCard,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export const LeadPipeline = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Confirm Trial Modal
  const [confirmModalLead, setConfirmModalLead] = useState(null);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmTime, setConfirmTime] = useState('17:00:00');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Convert Lead Modal
  const [convertModalLead, setConvertModalLead] = useState(null);
  const [convertPlanId, setConvertPlanId] = useState(1); // Gold tier default
  const [convertPassword, setConvertPassword] = useState('Welcome@123');
  const [convertLoading, setConvertLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, courtsRes] = await Promise.all([
        trialService.getAllLeads({ status: statusFilter, search: searchQuery }),
        courtService.getCourts(),
      ]);
      const leadsData = leadsRes.data || leadsRes;
      const courtsData = courtsRes.data || courtsRes;
      setLeads(leadsData || []);
      setCourts(courtsData || []);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', text: 'Failed to load leads pipeline.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, searchQuery]);

  // Handle Quick Status Update
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await trialService.updateLeadStatus(leadId, newStatus);
      setNotification({ type: 'success', text: `Status updated to ${newStatus}` });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.message || err.message || 'Update failed' });
    }
  };

  // Open Confirmation Modal
  const openConfirmModal = (lead) => {
    setConfirmModalLead(lead);
    setConfirmDate(lead.preferred_date ? lead.preferred_date.slice(0, 10) : new Date().toISOString().split('T')[0]);
    setConfirmTime(lead.preferred_time || '17:00:00');
    setConfirmNotes(lead.notes || '');
    setModalError(null);
    if (courts.length > 0) {
      setSelectedCourtId(courts[0].id);
    }
  };

  // Submit Court Allocation Confirmation
  const submitConfirmTrial = async (e) => {
    e.preventDefault();
    setConfirmLoading(true);
    setModalError(null);
    try {
      await trialService.confirmTrial({
        lead_id: confirmModalLead.id,
        court_id: selectedCourtId,
        booking_date: confirmDate,
        start_time: confirmTime,
        notes: confirmNotes,
      });
      setConfirmModalLead(null);
      setNotification({ type: 'success', text: 'Court allocated & guest session confirmed successfully!' });
      await loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to allocate court slot.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Submit Lead to Member Conversion
  const submitConvertLead = async (e) => {
    e.preventDefault();
    setConvertLoading(true);
    try {
      const res = await trialService.convertLeadToMember(convertModalLead.id, convertPlanId, convertPassword);
      setConvertModalLead(null);
      setNotification({
        type: 'success',
        text: `Guest converted to active member! Pass issued: ${res.memberCode || 'Success'}`,
      });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.message || err.message || 'Conversion failed.' });
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-champion-dark uppercase tracking-tight">
              Visitor History & Guest Court CRM
            </h1>
            <Badge variant="staff">Internal Concierge Ledger</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track visitor repeat bookings, court allocations, standard non-member fees, and one-click member conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none"
            >
              <option value="ALL">All Stages</option>
              <option value="REQUESTED">Pending Request</option>
              <option value="CONFIRMED">Confirmed & Allocated</option>
              <option value="COMPLETED">Played / Completed</option>
              <option value="CONVERTED">Converted to Member</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ref, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-50 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-champion-blue outline-none"
            />
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-bold">Loading visitor records...</div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center text-gray-400">No visitor records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 uppercase tracking-wider font-bold">
                  <th className="p-4">Reference & Visitor</th>
                  <th className="p-4">Visit History</th>
                  <th className="p-4">Sport & Date</th>
                  <th className="p-4">Allocated Court & Fee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Visitor Info */}
                    <td className="p-4">
                      <div className="font-mono text-[10px] font-bold text-champion-blue">
                        {lead.reference_code || `GST-${lead.id}`}
                      </div>
                      <div className="font-black text-gray-900 text-sm">{lead.full_name}</div>
                      <div className="text-[11px] text-gray-400 flex items-center space-x-2 mt-0.5">
                        <span>{lead.phone}</span>
                        <span>•</span>
                        <span>{lead.email}</span>
                      </div>
                    </td>

                    {/* Visit History (Admin / Front Desk Only) */}
                    <td className="p-4">
                      <div className="inline-flex items-center space-x-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700 font-bold text-[11px]">
                        <History className="w-3.5 h-3.5 text-champion-blue" />
                        <span>
                          {lead.visit_count > 1
                            ? `Visit #${lead.visit_count}`
                            : '1st Visit Guest'}
                        </span>
                      </div>
                    </td>

                    {/* Sport & Date */}
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{lead.sport_interest}</div>
                      <div className="text-gray-500 text-[11px] flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{lead.preferred_date ? lead.preferred_date.slice(0, 10) : ''}</span>
                        <span>at</span>
                        <span className="font-semibold">{lead.preferred_time?.slice(0, 5)}</span>
                      </div>
                    </td>

                    {/* Allocated Court & Fee */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div>
                          {lead.court_name ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              {lead.court_name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Unallocated</span>
                          )}
                        </div>
                        <div className="text-[11px] font-black text-gray-700">
                          ₹{parseFloat(lead.fee_charged || 1200).toFixed(2)}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <Badge
                        variant={
                          lead.status === 'CONFIRMED'
                            ? 'success'
                            : lead.status === 'CONVERTED'
                            ? 'primary'
                            : lead.status === 'COMPLETED'
                            ? 'neutral'
                            : lead.status === 'CANCELLED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {lead.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {lead.status === 'REQUESTED' && (
                          <button
                            onClick={() => openConfirmModal(lead)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm Slot</span>
                          </button>
                        )}

                        {lead.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusChange(lead.id, 'COMPLETED')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Played</span>
                          </button>
                        )}

                        {lead.status !== 'CONVERTED' && (
                          <button
                            onClick={() => setConvertModalLead(lead)}
                            className="bg-champion-dark hover:bg-black text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center space-x-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Convert to Member</span>
                          </button>
                        )}

                        {lead.status !== 'CANCELLED' && lead.status !== 'CONVERTED' && (
                          <button
                            onClick={() => handleStatusChange(lead.id, 'CANCELLED')}
                            className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50"
                            title="Cancel Request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Slot Modal */}
      {confirmModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-gray-900 uppercase">Confirm Guest Court Booking</h3>
                <p className="text-xs text-gray-500">
                  {confirmModalLead.full_name} • {confirmModalLead.sport_interest} (₹{parseFloat(confirmModalLead.fee_charged || 1200).toFixed(2)})
                </p>
              </div>
              <button onClick={() => setConfirmModalLead(null)} className="text-gray-400 font-bold">
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={submitConfirmTrial} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Court</label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="w-full p-2 border rounded-xl font-semibold outline-none focus:ring-2 focus:ring-champion-blue"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={confirmDate}
                    onChange={(e) => setConfirmDate(e.target.value)}
                    className="w-full p-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Start Time</label>
                  <select
                    value={confirmTime}
                    onChange={(e) => setConfirmTime(e.target.value)}
                    className="w-full p-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue bg-white"
                  >
                    {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => {
                      const timeVal = `${String(h).padStart(2, '0')}:00:00`;
                      return (
                        <option key={timeVal} value={timeVal}>
                          {timeVal.slice(0, 5)} (60 Mins)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Staff Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Visitor requesting demo gear"
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full p-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmModalLead(null)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={confirmLoading}
                  className="flex-1 text-xs"
                >
                  {confirmLoading ? 'Allocating Court...' : 'Confirm Court Allocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead to Member Modal */}
      {convertModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-gray-900 uppercase">Convert Prospect to Member</h3>
                <p className="text-xs text-gray-500">
                  {convertModalLead.full_name} ({convertModalLead.email})
                </p>
              </div>
              <button onClick={() => setConvertModalLead(null)} className="text-gray-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={submitConvertLead} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Membership Tier</label>
                <select
                  value={convertPlanId}
                  onChange={(e) => setConvertPlanId(parseInt(e.target.value, 10))}
                  className="w-full p-2 border rounded-xl font-semibold outline-none focus:ring-2 focus:ring-champion-blue"
                >
                  <option value={1}>Gold Tier VIP (₹9,999/mo - 100% Free Courts)</option>
                  <option value={2}>Silver Tier (₹4,999/mo - 25% Off Courts)</option>
                  <option value={3}>Junior Tier (₹2,999/mo - 50% Off Courts)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Initial Temporary Password</label>
                <input
                  type="text"
                  required
                  value={convertPassword}
                  onChange={(e) => setConvertPassword(e.target.value)}
                  className="w-full p-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConvertModalLead(null)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={convertLoading}
                  className="flex-1 text-xs"
                >
                  {convertLoading ? 'Converting...' : 'Issue Digital Member Pass'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
