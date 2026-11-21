import React, { useState, useEffect } from 'react';
import { membershipService } from '../../services/membershipService';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  Users, 
  Search, 
  UserPlus, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  Calendar, 
  X,
  CreditCard,
  Check
} from 'lucide-react';

export const MemberDirectory = () => {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [renewMonths, setRenewMonths] = useState(12);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    planId: '',
    durationMonths: 12,
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    try {
      const [membersRes, plansRes] = await Promise.all([
        membershipService.getMembers(search),
        membershipService.getPlans(),
      ]);
      if (membersRes.data) setMembers(membersRes.data);
      if (plansRes.data) {
        setPlans(plansRes.data);
        if (!formData.planId && plansRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, planId: plansRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMessage('');
    try {
      await membershipService.registerMember(formData);
      setToastMessage('New athlete registered successfully!');
      setIsRegisterOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        planId: plans[0]?.id || '',
        durationMonths: 12,
        dateOfBirth: '',
        emergencyContact: '',
        emergencyPhone: '',
      });
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      await membershipService.renewMembership(selectedMember.membership_id, renewMonths);
      setToastMessage(`Renewed ${selectedMember.full_name} for +${renewMonths} month(s)!`);
      setIsRenewOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Renewal failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-champion-dark uppercase tracking-tight">
            Front Desk Member Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Search active profiles, register walk-in athletes, and process on-the-spot plan renewals.
          </p>
        </div>

        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => {
            setErrorMessage('');
            setIsRegisterOpen(true);
          }}
          className="text-xs font-black uppercase tracking-wider px-5 py-3 shadow-md"
        >
          Register Walk-In Athlete
        </Button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-900 font-bold">Dismiss</button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Instant search by athlete name, email, phone number, or member code (e.g. 'CC-GOLD')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600 font-bold">
            Clear
          </button>
        )}
      </div>

      {/* Member Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Athlete / Member Code</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Current Plan</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-champion-red mx-auto"></div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                    No matching members found in directory.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const isGold = m.plan_tier === 'GOLD';
                  const isSilver = m.plan_tier === 'SILVER';
                  const isJunior = m.plan_tier === 'JUNIOR';
                  return (
                    <tr key={m.user_id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{m.full_name}</div>
                        <div className="font-mono text-xs font-semibold text-champion-red mt-0.5">
                          {m.member_code}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs space-y-0.5">
                        <div className="text-gray-600 flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1 text-gray-400" /> {m.email}
                        </div>
                        <div className="text-gray-600 flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" /> {m.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={isGold ? 'gold' : isSilver ? 'silver' : isJunior ? 'junior' : 'default'}>
                          {m.plan_tier || 'NO PLAN'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-600">
                        {m.end_date ? new Date(m.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> ACTIVE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={RefreshCw}
                          onClick={() => {
                            setSelectedMember(m);
                            setErrorMessage('');
                            setIsRenewOpen(true);
                          }}
                          className="text-xs font-bold"
                        >
                          Renew Plan
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Walk-In Member */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-champion-dark uppercase tracking-tight">
                Register Walk-In Athlete
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Creates an athlete account and assigns membership with real-time discounts.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Vikram Malhotra"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="athlete@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Membership Plan *
                  </label>
                  <select
                    className="block w-full rounded border border-gray-300 py-2.5 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-champion-red focus:border-champion-red"
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${parseFloat(p.monthly_fee).toFixed(0)}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Initial Duration *
                  </label>
                  <select
                    className="block w-full rounded border border-gray-300 py-2.5 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-champion-red focus:border-champion-red"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                  >
                    <option value={1}>1 Month</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <Input
                  label="Emergency Contact"
                  placeholder="Name & Contact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button variant="ghost" onClick={() => setIsRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Creating Membership...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Renew Membership */}
      {isRenewOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setIsRenewOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold text-champion-red uppercase tracking-wider">
                Extend Validity
              </span>
              <h2 className="text-2xl font-black text-champion-dark uppercase tracking-tight mt-1">
                Renew Membership
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Athlete: <span className="font-bold text-gray-800">{selectedMember.full_name}</span> ({selectedMember.member_code})
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Select Extension Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRenewMonths(m)}
                      className={`py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                        renewMonths === m
                          ? 'bg-champion-red text-white border-champion-red shadow-md'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      +{m} {m === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Current Expiration:</span>
                  <span className="font-mono font-bold">
                    {selectedMember.end_date ? new Date(selectedMember.end_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-champion-dark font-bold">
                  <span>Status upon renewal:</span>
                  <span className="text-emerald-700">ACTIVE</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <Button variant="ghost" onClick={() => setIsRenewOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Extending...' : 'Confirm Renewal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
